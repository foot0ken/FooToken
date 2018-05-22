
var FooToken = artifacts.require("./FooToken.sol");
var FooTokenSale = artifacts.require("./FooTokenSale.sol");

module.exports = function(deployer, network, accounts) {
    const whiteList = [];

    // For development
    var walletAddress = accounts[5];
    if (network === "ropsten") {
        walletAddress = accounts[0];
    }

    var token, sale;

    return deployer
        .then(() => {
            return deployer.deploy(FooToken, 10000);
        }).then((instance) => {
            token = instance;
            return deployer.deploy(FooTokenSale, FooToken.address, walletAddress, whiteList);
        }).then((instance) => {
            sale = instance;
            token.setMinter(FooTokenSale.address);
            
            console.log("Token : " + FooToken.address);
            console.log("Sale  : " + FooTokenSale.address);
        });
};
