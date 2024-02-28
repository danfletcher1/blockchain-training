const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1.js")
const keccak = require("ethereum-cryptography/keccak")
const utils = require("ethereum-cryptography/utils")

app.use(cors());
app.use(express.json());

const balances = {
// 8a54c010a302169ab43da79747233e6b3227fbd2598f8680c4f716357f01b3d7
  "04e5e85c3ecc1a81510b6648e96b0a5432c937aaa29f06869f076838428ec08430b39f4ea7678c6ee5ade6d9121bd4e2574b5672f832786510257f4d6d0e739497": 100,
// ac5b5c6535877a4342142ec4790ab4a2e32bd1650ec3093f39879522eab8a15f
  "04bf978facfa178f48828d682874b6ce778e5bbbc11d1d09f0eeff44d743b8803705a5ddcda088da22a401da45f3ff458892223facef31accd22b37deaaed7eb91": 50,
// ac5b5c6535877a4342142ec4790ab4a2e32bd1650ec3093f39879522eab8a15f
  "049ff7ce0b3de22f2874a6fb17a02887a6ec244ddd98df81628812b2805673ec3bd7f5878a80289a9d9bccdd38776d03da0f81551b367803cb0cc382e0065f82f8": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});



app.post("/send", (req, res) => {
  const { signature, publickey, message } = req.body;

  const hash = keccak.keccak256(utils.utf8ToBytes(JSON.stringify(message)))
  const validate = secp.secp256k1.verify(signature, hash, publickey)

  console.log(validate)

  setInitialBalance(publickey);
  setInitialBalance(message.recipient);

  if (balances[publickey] < message.amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[publickey] -= message.amount;
    balances[message.recipient] += message.amount;
    res.send({ balance: balances[publickey] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
