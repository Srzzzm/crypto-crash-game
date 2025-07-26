# Crypto Crash Game

Source code for "Crypto Crash" an online multiplayer crash game where players bet in USD which is converted to cryptocurrency. The game features real-time price integration a provably fair crash algorithm and live updates via WebSockets.

## Features

* **Real-Time Game Logic:** A continuous game loop starts a new round every 10 seconds.
* [cite_start]**Cryptocurrency Integration:** Fetches live prices for BTC and ETH from the CoinGecko API for real-time bet conversions. [cite: 35]
* [cite_start]**Simulated Wallets:** Manages player balances in a simulated crypto wallet system. [cite: 38]
* [cite_start]**Provably Fair:** Utilizes a SHA256-based hashing algorithm with a server seed and round number to ensure transparent and verifiable crash points. [cite: 26, 28]
* [cite_start]**Live Multiplayer Experience:** Uses WebSockets to broadcast all game events, including multiplier updates, cash-outs, and crash events, to all connected clients. [cite: 59]
* **RESTful API:** Provides endpoints for placing bets, checking wallet balances, and seeding the database.

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Real-Time Communication:** Socket.IO
* **API Requests:** Axios

## Setup and Installation

### Prerequisites

* Node.js (v18 or later recommended)
* MongoDB
* Postman (for API testing)

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd crypto-crash-game
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Ensure MongoDB is running:**
    Make sure your local MongoDB service is active.

4.  **Start the server:**
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:5000`.

## API Endpoints

| Method | Endpoint               | Description                                                              | Request Body                                        |
| :----- | :--------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------- |
| `POST` | `/api/setup/user`      | Creates a default test user with a pre-filled wallet for easy testing.   | (None)                                              |
| `GET`  | `/api/wallet/:userId`  | Fetches a user's wallet balance in crypto and its real-time USD value. | (None)                                              |
| `POST` | `/api/bet`             | [cite_start]Places a bet for a user in the current round's waiting phase. [cite: 24]        | `{ "userId": "...", "amountUSD": 10, "currency": "BTC" }` |

## WebSocket Events

The server broadcasts the following events to all connected clients.

| Event Name          | Payload                                | Description                                                 |
| :------------------ | :------------------------------------- | :---------------------------------------------------------- |
| `round_starting`    | `{ nextRoundIn: 5000 }`                | [cite_start]Signals a new round is about to begin. [cite: 61]                    |
| `round_started`     | `{ startTime: ... }`                   | The game round has started and the multiplier is running.      |
| `multiplier_update` | `{ multiplier: 2.54 }`                 | [cite_start]Sent every 100ms with the new multiplier value. [cite: 62]         |
| `crash`             | `{ crashPoint: 4.51 }`                 | [cite_start]The round has ended and crashed at the specified multiplier. [cite: 64] |
| `player_cashed_out` | `{ username: "...", cashoutMultiplier: 3.12 }` | [cite_start]A player has successfully cashed out. [cite: 63]                 |

## Provably Fair Algorithm

[cite_start]The crash point for each round is determined in a provably fair manner to ensure transparency. [cite: 26]

1.  A secret **Server Seed** is generated once when the server starts.
2.  For each round, an incrementing **Round Number** is used.
3.  [cite_start]The crash point is derived from a SHA256 hash of the combined Server Seed and Round Number: `hash = sha256(serverSeed + roundNumber)`. [cite: 29]
4.  A portion of this hash is converted to a number to determine the crash multiplier, ensuring it's deterministic and verifiable if the seed is revealed later.

## Database Seeding

To populate the database with a sample user for testing, send a `POST` request to the `/api/setup/user` endpoint. This will create a user named `testuser1` with a balance of `0.1 BTC` and `2 ETH`. [cite_start]You can use the `_id` returned in the response for all other API calls. [cite: 95]