var FooToken = artifacts.require("./FooToken.sol");
var FooTokenSale = artifacts.require("./FooTokenSale.sol");

contract('FooTokenSale', async function(accounts) {
  var sale;

  describe('initialized correctly', () => {
    var token, sale;

    it("should has Token address correctly", async function() {
      token = await FooToken.deployed();
      sale  = await FooTokenSale.deployed();

      const expect = await token.address;
      const actual = await sale.token();

      assert.equal(actual, expect);
    });

    it("should be equal to Minter address of Token collectly", async function() {
      const expect = await sale.address;
      const actual = await token.minter();

      assert.equal(actual, expect);
    });

    it("should has Wallet address correctly", async function() {
      const expect = await accounts[5];
      const actual = await sale.wallet();

      assert.equal(actual, expect);
    });
  });

  it('should be able to add address to WhiteList correctly', async function() {
    const sale = await FooTokenSale.deployed();

    const beforeIsAllow = await sale.isAllow(accounts[1]);
    assert.isFalse(beforeIsAllow);

    await sale.addWhiteList([accounts[1]], {
        from: accounts[0]
      });

    const alterIsAllow = await sale.isAllow(accounts[1]);
    assert.isTrue(alterIsAllow);
  });

  it('should be able to purchase token', async function() {
    const token = await FooToken.deployed();
    const sale = await FooTokenSale.deployed();

    const beforeBalance = await web3.eth.getBalance(accounts[1]);
    assert.equal(web3.fromWei(beforeBalance.toNumber(), "ether"), 100);

    const beforeAmount = await token.balanceOf(accounts[1]);
    assert.equal(beforeAmount.toNumber(), 0);

    await sale.purchaseToken(accounts[1], {
        from: accounts[1],
        value: web3.toWei(1, "ether")
      });

    const aflterBalance = await web3.eth.getBalance(accounts[1]);
    assert.isBelow(web3.fromWei(aflterBalance.toNumber(), "ether"), 99); // 1 + tx fee

    const afterAmount = await token.balanceOf(accounts[1]);
    assert.equal(afterAmount.toNumber(), 1000);

    const balanceOfWallet = await web3.eth.getBalance(accounts[5]);
    assert.equal(web3.fromWei(balanceOfWallet.toNumber(), "ether"), 101);
  });

  it('should not be able to purchase a token without permitted', async function() {
    const token = await FooToken.deployed();
    const sale = await FooTokenSale.deployed();

    const beforeAmount = await token.balanceOf(accounts[2]);
    assert.equal(beforeAmount.toNumber(), 0);

    try {
      await sale.purchaseToken(accounts[2], {
        from: accounts[2],
        value: web3.toWei(1, "ether")
      });
    } catch (error) {
      revert = error.message.search('revert') >= 0;
      assert.isTrue(revert);
    }
  });
});
