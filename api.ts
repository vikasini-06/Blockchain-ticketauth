export const verifyTicket = async (ticketId: string, wallet: string) => {

  const res = await fetch("http://localhost:5000/api/verify-ticket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ticketId,
      wallet
    })
  })

  return await res.json()
}
