const {ethers} = require("hardhat");

async function main() {
    const campaignFactoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractAt("CampaignFactory", campaignFactoryAddress);

    const beneficiary = owner.address;
    const targetAmount = ethers.parseEther("300.0");
    const durationInSeconds = 3600; // 1 hour
    const campaignDescription = "This is a sample campaign description.";

    const tx = await factory.createCampaign(
        beneficiary,
        targetAmount,
        durationInSeconds,
        campaignDescription
    );
    await tx.wait();

    const campaigns = await factory.getDeployedCampaigns();
    const newCampaignAddress = campaigns[campaigns.length - 1];
    console.log(`Campaign mới được tạo tại địa chỉ: ${newCampaignAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});