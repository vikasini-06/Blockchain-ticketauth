import express from "express"
import { verifyTicket } from "../services/blockchain.js"

const router = express.Router()

router.post("/verify-ticket", async (req, res) => {

  try {

    const { ticketId, wallet } = req.body

    const result = await verifyTicket(ticketId, wallet)

    res.json(result)

  } catch (error) {

    res.status(500).json({
      valid: false,
      message: "Verification failed"
    })

  }

})

export default router
