import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { utf8ToBytes, bytesToHex, toHex } from "ethereum-cryptography/utils";
import  { keccak256 } from "ethereum-cryptography/keccak";


function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const msg = {
      amount: parseInt(sendAmount),
      recipient: recipient,
    };
  
    const hash = keccak256(utf8ToBytes(JSON.stringify(msg)))
    const sign = secp256k1.sign(hash, privateKey).toCompactHex();
    const address = toHex(secp256k1.getPublicKey(privateKey, false));

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: sign,
        publickey: address,
        message: msg,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
