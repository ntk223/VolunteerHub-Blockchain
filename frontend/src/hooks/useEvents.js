import { useEffect, useRef, useState, useCallback } from 'react';
import contractService from '../utils/contractService.js';
import toast from 'react-hot-toast';

// Utility function để throttle notifications
const throttleNotifications = (() => {
  const lastNotificationTime = {};
  return (key, callback, delay = 2000) => {
    const now = Date.now();
    if (!lastNotificationTime[key] || now - lastNotificationTime[key] > delay) {
      lastNotificationTime[key] = now;
      callback();
    }
  };
})();

// Hook để lắng nghe events của một campaign cụ thể
export const useEvents = (campaignAddress) => {
  const [events, setEvents] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const unsubscribeRef = useRef(null);

  // Bắt đầu lắng nghe events
  const startListening = useCallback(() => {
    if (!campaignAddress || isListening) return;

    console.log(`Starting to listen to events for campaign: ${campaignAddress}`);
    setIsListening(true);

    const unsubscribe = contractService.listenToAllEvents(campaignAddress, (eventData) => {
      console.log('New event received:', eventData);
      
      // Thêm event mới vào danh sách với batching
      setEvents(prev => {
        // Tránh duplicate events
        const isDuplicate = prev.some(e => 
          e.transactionHash === eventData.transactionHash && 
          e.type === eventData.type
        );
        if (isDuplicate) return prev;
        
        return [eventData, ...prev.slice(0, 99)]; // Giữ tối đa 100 events
      });
      
      // Hiển thị notification với throttling
      const notificationKey = `${eventData.type}-${campaignAddress}`;
      throttleNotifications(notificationKey, () => {
        switch (eventData.type) {
          case 'donated':
            toast.success(`Có người vừa donate ${eventData.amount} ETH! 🎉`, {
              duration: 5000,
              icon: '💰'
            });
            break;
          case 'proposalCreated':
            toast.info(`Có đề xuất mới được tạo! 📝`, {
              duration: 4000,
              icon: '📋'
            });
            break;
          case 'voted':
            toast.info(`Có người vừa vote ${eventData.support ? 'ủng hộ' : 'phản đối'}! 🗳️`, {
              duration: 3000,
              icon: '🗳️'
            });
            break;
          case 'proposalExecuted':
            toast.success(`Đề xuất đã được thực hiện! ${eventData.amount} ETH đã được chuyển 🚀`, {
              duration: 6000,
              icon: '✅'
            });
            break;
          case 'refunded':
            toast.success(`Hoàn tiền thành công: ${eventData.amount} ETH 💸`, {
              duration: 4000,
              icon: '💸'
            });
            break;
          default:
            console.log('Unknown event type:', eventData.type);
        }
      });
    });

    unsubscribeRef.current = unsubscribe;
  }, [campaignAddress]);

  // Dừng lắng nghe events
  const stopListening = useCallback(() => {
    if (!isListening) return;

    console.log(`Stopping event listening for campaign: ${campaignAddress}`);
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    setIsListening(false);
  }, []);

  // Tải events đã qua
  const loadPastEvents = useCallback(async (fromBlock = 0) => {
    if (!campaignAddress) return;

    try {
      const eventTypes = ['Donated', 'ProposalCreated', 'Voted', 'ProposalExecuted', 'Refunded'];
      const allPastEvents = [];

      for (const eventType of eventTypes) {
        const pastEvents = await contractService.getPastEvents(campaignAddress, eventType, fromBlock);
        allPastEvents.push(...pastEvents);
      }

      // Sắp xếp theo block number (mới nhất lên đầu)
      allPastEvents.sort((a, b) => b.blockNumber - a.blockNumber);
      
      setEvents(allPastEvents);
      console.log('Loaded past events:', allPastEvents);
    } catch (error) {
      console.error('Error loading past events:', error);
      toast.error('Không thể tải lịch sử sự kiện');
    }
  }, [campaignAddress]);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Auto start/stop khi campaignAddress thay đổi
  useEffect(() => {
    let shouldListen = true;
    
    const initEventListening = async () => {
      if (campaignAddress && shouldListen) {
        console.log(`Starting to listen to events for campaign: ${campaignAddress}`);
        setIsListening(true);

        const unsubscribe = contractService.listenToAllEvents(campaignAddress, (eventData) => {
          if (!shouldListen) return;
          
          console.log('New event received:', eventData);
          
          // Thêm event mới vào danh sách với batching
          setEvents(prev => {
            const isDuplicate = prev.some(e => 
              e.transactionHash === eventData.transactionHash && 
              e.type === eventData.type
            );
            if (isDuplicate) return prev;
            
            return [eventData, ...prev.slice(0, 99)];
          });
          
          // Throttled notifications
          const notificationKey = `${eventData.type}-${campaignAddress}`;
          throttleNotifications(notificationKey, () => {
            switch (eventData.type) {
              case 'donated':
                toast.success(`Có người vừa donate ${eventData.amount} ETH! 🎉`, {
                  duration: 5000,
                  icon: '💰'
                });
                break;
              default:
                break;
            }
          });
        });

        unsubscribeRef.current = unsubscribe;
        
        // Load past events
        try {
          const eventTypes = ['Donated', 'ProposalCreated', 'Voted', 'ProposalExecuted', 'Refunded'];
          const allPastEvents = [];

          for (const eventType of eventTypes) {
            const pastEvents = await contractService.getPastEvents(campaignAddress, eventType, 0);
            allPastEvents.push(...pastEvents);
          }

          allPastEvents.sort((a, b) => b.blockNumber - a.blockNumber);
          if (shouldListen) {
            setEvents(allPastEvents);
          }
        } catch (error) {
          console.error('Error loading past events:', error);
        }
      }
    };

    initEventListening();

    return () => {
      shouldListen = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsListening(false);
    };
  }, [campaignAddress]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return {
    events,
    isListening,
    startListening,
    stopListening,
    loadPastEvents,
    clearEvents
  };
};

// Hook để lắng nghe events của tất cả campaigns (cho trang chính)
export const useGlobalCampaignEvents = () => {
  const [globalEvents, setGlobalEvents] = useState([]);
  const [listeningCampaigns, setListeningCampaigns] = useState(new Set());
  const unsubscribeRefs = useRef(new Map());

  // Thêm campaign để lắng nghe
  const addCampaignListener = (campaignAddress) => {
    if (!campaignAddress || listeningCampaigns.has(campaignAddress)) return;

    console.log(`Adding global listener for campaign: ${campaignAddress}`);
    
    const unsubscribe = contractService.listenToAllEvents(campaignAddress, (eventData) => {
      setGlobalEvents(prev => [{ ...eventData, campaignAddress }, ...prev.slice(0, 49)]); // Giữ tối đa 50 events
      
      // Hiển thị notification cho global events
      if (eventData.type === 'donated') {
        toast.success(`Có donation mới trong campaign ${campaignAddress.slice(0, 6)}...! 💰`, {
          duration: 3000
        });
      }
    });

    unsubscribeRefs.current.set(campaignAddress, unsubscribe);
    setListeningCampaigns(prev => new Set(prev).add(campaignAddress));
  };

  // Xóa campaign khỏi danh sách lắng nghe
  const removeCampaignListener = (campaignAddress) => {
    if (!listeningCampaigns.has(campaignAddress)) return;

    console.log(`Removing global listener for campaign: ${campaignAddress}`);
    
    const unsubscribe = unsubscribeRefs.current.get(campaignAddress);
    if (unsubscribe) {
      unsubscribe();
      unsubscribeRefs.current.delete(campaignAddress);
    }

    setListeningCampaigns(prev => {
      const newSet = new Set(prev);
      newSet.delete(campaignAddress);
      return newSet;
    });
  };

  // Dọn dẹp tất cả listeners
  const cleanup = () => {
    console.log('Cleaning up all global campaign listeners');
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current.clear();
    setListeningCampaigns(new Set());
    setGlobalEvents([]);
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return {
    globalEvents,
    listeningCampaigns: Array.from(listeningCampaigns),
    addCampaignListener,
    removeCampaignListener,
    cleanup
  };
};