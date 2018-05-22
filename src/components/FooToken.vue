<template>
  <div class="tokenuser">
    <div class="content">
      <p v-if="contractAddress">The Token contract is deployed at {{contractAddress}}</p>
      <p v-if="!contractAddress">No contracts found</p>

      <p v-if="account">Current account: {{account}}</p>
      <p v-if="!account">No accounts found</p>

      <p v-if="currentAmount">Current ammount: {{currentAmount}}</p>

      <div>
        <h3>Purchase Token</h3>
        <form>
          <div class="grid-container">
            <div class="grid-x grid-padding-x">
              <div class="medium-3 cell">
                <label>Input ether
                  <input v-model="ether" type="number" placeholder="ether">
                </label>
              </div>
              <div class="medium-2 cell">
                <button v-if="!isAllowPurchase" class="hollow button alert" disabled>
                  Unauthorized
                </button>
                <button v-if="isAllowPurchase" class="hollow button" @click="purchaseToken">
                  Purchase
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div>
        <h3>Send Token</h3>
        <form>
          <div class="grid-container">
            <div class="grid-x grid-padding-x">
              <div class="medium-6 cell">
                <label>Input address
                  <input v-model="targetUser" type="text" placeholder="address">
                </label>
              </div>
              <div class="medium-3 cell">
                <label>Input amount
                  <input v-model="sendAmount" type="number" placeholder="amount">
                </label>
              </div>
              <div class="medium-3 cell">
                <button class="hollow button" @click="sendToken">
                  Send token
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div>
        <h3>Users</h3>
        <table class="hover">
          <thead>
            <tr>
              <th>address</th>
              <th>amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" v-bind:key="user.address">
              <td>{{user.address}}</td>
              <td>{{user.amount}}</td>
              <td>
                <button v-show="user.address.toLowerCase() != contractAddress.toLowerCase()" class="hollow button" @click="setAddress(user.address)">Send</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="message" v-if="message">{{message}}</div>
  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'

import fooTokenArtifacts from '../../build/contracts/FooToken.json'
const FooToken = contract(fooTokenArtifacts)
import fooTokenSaleArtifacts from '../../build/contracts/FooTokenSale.json'
const FooTokenSale = contract(fooTokenSaleArtifacts)

export default {
  name: 'FooToken',
  data() {
    return {
      message: null,

      contractAddress: null,
      account: null,
      currentAmount: 0,
      isAllowPurchase: false,

      ether: 0,

      users: [],
      targetUser: null,
      sendAmount: 0,
    }
  },
  created() {
    if (typeof web3 !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 Fluyd, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      web3 = new Web3(web3.currentProvider)
    } else {
      console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"))
    }

    FooToken.setProvider(web3.currentProvider)
    FooTokenSale.setProvider(web3.currentProvider)
    web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        console.error(err)
        this.message = "There was an error fetching your accounts. Do you have Metamask, Mist installed or an Ethereum node running? If not, you might want to look into that"
        return
      }

      if (accs.length == 0) {
        this.message = "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        return
      }
      this.account = accs[0];

      Promise.all([
        FooToken.deployed(),
        FooTokenSale.deployed()
        ])
      .then(([token, sale]) => {
        return Promise.all([
          token.address,
          token.balanceOf(this.account),
          sale.isAllow(this.account)
          ])
      })
      .then((results) => {
        this.contractAddress = results[0]
        this.currentAmount   = results[1].toNumber()
        this.isAllowPurchase = results[2]
        
        this.updateUsers()
      })
    })
  },
  methods: {
    setAddress(address) {
      this.targetUser = address;
    },

    sendToken() {
      this.transferToken(this.targetUser, this.sendAmount)
    },

    transferToken(to, amount) {
      this.message = "Transaction started";

      return FooToken.deployed()
        .then((instance) => {
          return instance.transfer(to, amount, {from: this.account})
        })
        .then(() => {
          this.message = "Transaction done"
          this.updateUsers()
        })
        .catch((e) => {
          console.error(e)
          this.message = "Transaction failed"
        })
    },

    purchaseToken() {
      this.message = "Transaction started";

      return FooTokenSale.deployed()
        .then((instance) => {
          return instance.sendTransaction({
            from: this.account,
            value: web3.utils.toWei(this.ether, "ether")
            })
        })
        .then(() => {
          this.message = "Transaction done"
          this.updateUsers()
        })
        .catch((e) => {
          console.error(e)
          this.message = "Transaction failed"
        })

    },

    updateUsers() {
      FooToken.deployed()
        .then((instance) => {
          Promise.resolve()
            .then(() => {
              return instance.getAddresses()
            }).then((users) => {
              return Promise.all(users.map((user) => {
                return instance.balanceOf(user).then((balance) => {
                  return {
                    address: user,
                    amount: balance.toNumber()
                  }
                })
              }))
            }).then((users) => {
              this.users = users
            })
          })
    },
  },
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.content {
  padding: 13px 13px 39px 13px;
}
.message {
  background: #eee;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 13px;
  line-height: 1;
  padding: 13px;
}


.button {
  margin-top: 12px
}
</style>
