import { ethers } from "ethers"
import contractABI from "../config/contract.json" assert { type: "json" }

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  provider
)

export async function verifyTicket(ticketId, wallet) {
  try {

    const owner = await contract.ownerOf(ticketId)

    if (owner.toLowerCase() === wallet.toLowerCase()) {
      return {
        valid: true,
        message: "Ticket is valid"
      }
    }

    return {
      valid: false,
      message: "Ticket owner mismatch"
    }

  } catch (error) {

    return {
      valid: false,
      message: "Invalid ticket"
    }

  }
}
