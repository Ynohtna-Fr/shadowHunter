<script>
    import PlayersList from './components/PlayersList.svelte';
    import Card from '../display/Card.svelte';

    import Peer from 'peerjs';
    import { afterUpdate } from 'svelte';
    import { removeNull } from '../utils.js'

    export let hostId;

    let connectionToHost = null;
    let connectedToHostId = null;
    let connecting = false;
    let requestedName;

    let players = [];
    let card = null;
    let reveal = null;

    let connectingStatus = '';
    let connectionError = '';

    let peer;

    async function connect() {
        connecting = true;
        connectingStatus = 'connecting to broking server...';
        connectionError = '';
        peer = await createPeer();
        connectingStatus = 'connecting to host...';
        connectionToHost = peer.connect(hostId);

        connectionToHost.on('open', () => {
            connectingStatus = '';
            connecting = false;
            connectedToHostId = hostId;
            connectionToHost.send({
                action: 'name',
                data: {
                    name: requestedName
                }
            });
            connectionToHost.send({
                request: 'players'
            });
        });

        connectionToHost.on('data', (data) => {
            console.log('data received', data);
            if (data.type === 'players') {
                players = data.data;
            }
            if (data.type === 'card') {
                card = data.data;
            }
            if (data.type === 'reveal') {
                handleReveal(data.data)
            }
        });

        connectionToHost.on('close', () => {
            console.log('disconnected');
            connectionToHost = null;
            connectedToHostId = null;
            connectionError = 'Connection with host has been closed.';
        });

        connectionToHost.on('error', err => {
            console.log('connection error', err);
            connectionError = 'Connection error ' + err;
        });
    }

    function createPeer() {
        return new Promise((resolve) => {
            const urlParams = new URLSearchParams(window.location.search);
            const peerConfig = {
                host: urlParams.get('brokingHost'),
                port: urlParams.get('brokingPort'),
                path: urlParams.get('brokingPath'),
                key: urlParams.get('brokingKey')
            };
            removeNull(peerConfig);
            console.log(peerConfig);
            const newPeer = new Peer(peerConfig);
            newPeer.on('open', () => {
                resolve(newPeer);
            })
            newPeer.on('close', () => {
                console.log('peer closed');
                connectionToHost = null;
                connectedToHostId = null;
                peer = null;
            })
        });
    }

    function forceReconnect() {
        connectionToHost.send({
                action: 'leave'
        });
        setTimeout(() => {
            if (connectionToHost) {
                connectionToHost.close();
            }
            if (peer) {
                peer.destroy();
            }
            connect();
        }, 50);
    }

    function sendReveal() {
      connectionToHost.send({
        action: 'reveal',
        data: {
          player: requestedName,
          card: card
        }
      })

      reveal = card.team
    }

    function handleReveal(data) {
        const [revealPlayer] = players.filter(p => p.name === data.player)
        const textTeam = document.querySelector(`#player-${revealPlayer.playerId} span`)
        textTeam.classList.add(data.card.team)
        textTeam.innerText = data.card.team
        document.querySelector(`#player-${revealPlayer.playerId} img`).src = 'cards/images/' + data.card.imageFallbacks
    }
</script>

<style>
    .horizontal-flex {
        display: flex;
        flex-direction: row;
    }

    .flex-1 {
        flex: 1;
    }

    h1 > button {
        font-size: 0.5em;
        margin: 0;
    }

    .error {
        color: rgb(153, 13, 13);
    }

    .limit-width {
        max-width: 500px;
    }
</style>

<h1>
    Shadow Hunters
    {#if connectedToHostId || connecting}
        <button on:click={forceReconnect}>Force reconnect</button>
    {/if}
</h1>

{#if !connectedToHostId}
    <div>
        <input bind:value={requestedName}>
        <button
            on:click={connect}
            disabled={connecting}>
            Pick a name
        </button>
    </div>

    {#if connectingStatus}
        <p>{connectingStatus}</p>
    {/if}
{/if}

{#if connectionError}
    <p class="error">{connectionError}</p>
{/if}

{#if connectedToHostId}
    <div class="horizontal-flex">
        <div class="flex-1">
            <PlayersList {players} />
        </div>
    </div>
{/if}

{#if card && reveal == null}
    <div>
        <button
        on:click={sendReveal}
        >Se r??v??ler au grand jour</button>
    </div>
{/if}

{#if card}
    <div class="limit-width">
        <hr>
        <h2>Votre carte :</h2>
        <Card {card} />
    </div>
{/if}
