import React, { useState, useMemo, useCallback } from 'react';
import { 
  Activity, 
  DollarSign, 
  FileText, 
  Vote, 
  CheckCircle, 
  RefreshCw,
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const EventFeed = ({ events, isListening, onLoadPastEvents, onClearEvents }) => {
  const { formatAddress } = useAuth();
  const [filter, setFilter] = useState('all'); // all, donated, proposals, votes

  const getEventIcon = useCallback((eventType) => {
    switch (eventType) {
      case 'donated':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'proposalCreated':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'voted':
        return <Vote className="w-4 h-4 text-purple-500" />;
      case 'proposalExecuted':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const getEventColor = useCallback((eventType) => {
    switch (eventType) {
      case 'donated':
        return 'bg-green-50 border-green-200';
      case 'proposalCreated':
        return 'bg-blue-50 border-blue-200';
      case 'voted':
        return 'bg-purple-50 border-purple-200';
      case 'proposalExecuted':
        return 'bg-emerald-50 border-emerald-200';
      case 'refunded':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  }, []);

  const formatEventDescription = useCallback((event) => {
    switch (event.type) {
      case 'donated':
        return (
          <div>
            <span className="font-medium">{formatAddress(event.donor)}</span>
            <span> đã donate </span>
            <span className="font-bold text-green-600">{parseFloat(event.amount).toFixed(4)} ETH</span>
          </div>
        );
      case 'proposalCreated':
        return (
          <div>
            <span>Đề xuất mới: </span>
            <span className="font-medium">{event.description}</span>
            <div className="text-sm text-gray-600 mt-1">
              Số tiền: <span className="font-medium">{parseFloat(event.amount).toFixed(4)} ETH</span>
              {' → '}
              <span className="font-medium">{formatAddress(event.recipient)}</span>
            </div>
          </div>
        );
      case 'voted':
        return (
          <div>
            <span className="font-medium">{formatAddress(event.voter)}</span>
            <span> đã vote </span>
            <span className={`font-bold ${event.support ? 'text-green-600' : 'text-red-600'}`}>
              {event.support ? 'UNG HO' : 'PHAN DOI'}
            </span>
            <span> với trọng số </span>
            <span className="font-medium">{parseFloat(event.weight).toFixed(4)} ETH</span>
          </div>
        );
      case 'proposalExecuted':
        return (
          <div>
            <span>Đề xuất #{event.proposalId} đã được thực hiện!</span>
            <div className="text-sm text-gray-600 mt-1">
              Chuyển <span className="font-bold text-emerald-600">{parseFloat(event.amount).toFixed(4)} ETH</span>
              {' → '}
              <span className="font-medium">{formatAddress(event.recipient)}</span>
            </div>
          </div>
        );
      case 'refunded':
        return (
          <div>
            <span className="font-medium">{formatAddress(event.donor)}</span>
            <span> đã được hoàn </span>
            <span className="font-bold text-orange-600">{parseFloat(event.amount).toFixed(4)} ETH</span>
          </div>
        );
      default:
        return <span>Sự kiện không xác định</span>;
    }
  }, [formatAddress]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filter === 'all') return true;
      if (filter === 'donated') return event.type === 'donated';
      if (filter === 'proposals') return ['proposalCreated', 'proposalExecuted'].includes(event.type);
      if (filter === 'votes') return event.type === 'voted';
      return true;
    });
  }, [events, filter]);

  const filterOptions = useMemo(() => [
    { value: 'all', label: 'Tất cả', count: events.length },
    { value: 'donated', label: 'Donations', count: events.filter(e => e.type === 'donated').length },
    { value: 'proposals', label: 'Đề xuất', count: events.filter(e => ['proposalCreated', 'proposalExecuted'].includes(e.type)).length },
    { value: 'votes', label: 'Votes', count: events.filter(e => e.type === 'voted').length }
  ], [events]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#667eea]" />
          <h4 className="font-semibold text-gray-800">Hoạt động gần đây</h4>
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadPastEvents}
            className="text-sm text-[#667eea] hover:text-[#764ba2] font-medium"
            title="Tải lại events"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClearEvents}
            className="text-sm text-gray-500 hover:text-gray-700"
            title="Xóa events"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === option.value
                ? 'bg-[#667eea] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === option.value ? 'bg-white/20' : 'bg-gray-300'
              }`}>
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{filter === 'all' ? 'Chưa có hoạt động nào' : 'Không có hoạt động phù hợp với bộ lọc'}</p>
            <p className="text-sm">
              {isListening ? 'Đang lắng nghe sự kiện mới...' : 'Bắt đầu lắng nghe để xem hoạt động'}
            </p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div 
              key={`${event.txHash}-${index}`}
              className={`border rounded-lg p-3 transition-all duration-200 hover:shadow-md ${getEventColor(event.type)}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    {formatEventDescription(event)}
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>Block #{event.blockNumber}</span>
                    </div>
                    
                    {event.txHash && (
                      <a
                        href={`https://etherscan.io/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#667eea] hover:text-[#764ba2] font-medium"
                      >
                        <span>Xem TX</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status */}
      <div className="text-center text-xs text-gray-500">
        {isListening ? (
          <span className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Đang lắng nghe sự kiện real-time
          </span>
        ) : (
          <span>Không đang lắng nghe sự kiện</span>
        )}
      </div>
    </div>
  );
};

export default React.memo(EventFeed);