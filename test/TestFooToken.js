var FooToken = artifacts.require("./FooToken.sol");

contract('FooToken', async function(accounts) {
  it("should put 10000 FooToken in the first account", async function() {
    const token = await FooToken.deployed();

    const expect = 10000;
    const actual = await token.balanceOf(accounts[0]);

    assert.equal(actual, expect);
  });

  it("should send coin correctly", async function() {
    const token = await FooToken.deployed();

    // Get initial balances of first and second account.
    const account_one = accounts[0];
    const account_two = accounts[1];

    const amount = 10;

    const account_one_starting_balance = await token.balanceOf(account_one);
    assert.equal(account_one_starting_balance, 10000);

    const account_two_starting_balance = await token.balanceOf(account_two);
    assert.equal(account_two_starting_balance, 0);

    await token.transfer(account_two, amount, {
        from: account_one
      });

    const account_one_ending_balance = await token.balanceOf(account_one);
    assert.equal(account_one_ending_balance, 10000 - amount);

    const account_two_ending_balance = await token.balanceOf(account_two);
    assert.equal(account_two_ending_balance, amount);
  });
});
