const {ethers} = require("hardhat");

async function main() {
    const campaignAddress = "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
    const campaign = await ethers.getContractAt("Campaign", campaignAddress);
    console.log(`🎯 Thông tin chi tiết Campaign tại địa chỉ: ${campaignAddress}\n`)
    console.log(`Người tạo: ${await campaign.owner()}`);
    console.log(`Mục tiêu: ${ethers.formatEther(await campaign.targetAmount())} ETH`);
    const createdAt = await campaign.createdAt();
    console.log(`Thời gian tạo: ${new Date(Number(createdAt) * 1000).toLocaleString()}`);
    console.log(`Tổng tiền đã quyên góp: ${ethers.formatEther(await campaign.totalRaised())} ETH`);
    const deadline = await campaign.deadline();
    console.log(`Hạn chót quyên góp: ${new Date(Number(deadline) * 1000).toLocaleString()}`);
    // const isSuccessful = await campaign.isSuccessful();
    // console.log(`Trạng thái chiến dịch: ${isSuccessful ? "THÀNH CÔNG" : "CHƯA THÀNH CÔNG"}`);
    console.log(`Mô tả chiến dịch: ${await campaign.campaignDescription()}\n`);

    console.log("📋 Danh sách người quyên góp:");
    // const [owner, donator1, donator2] = await ethers.getSigners();
    // const amount1 = await campaign.contributions(donator1.address);
    // const amount2 = await campaign.contributions(donator2.address);
    // console.log(campaign.donors());
    // console.log("Danh sách người quyên góp và số tiền họ đã đóng góp:");
    // console.log(`- Địa chỉ: ${donator1.address}, Số tiền đóng góp: ${ethers.formatEther(amount1)} ETH`);
    // console.log(`- Địa chỉ: ${donator2.address}, Số tiền đóng góp: ${ethers.formatEther(amount2)} ETH`);

    const donors = await campaign.getDonorCount();
    console.log("Tổng số:", donors);
    console.log("Danh sách người quyên góp và số tiền họ đã đóng góp:");
    for (let i = 0; i < donors; i++) {
        const donor = await campaign.donors(i);
        const amount = await campaign.contributions(donor);
        console.log(`- Địa chỉ: ${donor}, Số tiền đóng góp: ${ethers.formatEther(amount)} ETH`);
    }

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});