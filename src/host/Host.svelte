<script>
    import { PeerHost } from '../peer-host';
    import { createEventDispatcher } from 'svelte';
    import GameCreationForm from './GameCreationForm.svelte';

    const dispatch = createEventDispatcher();
    const host = new PeerHost();
    let hostId;
    let players = [];

    let brokingHost;
    let brokingPort;
    let brokingPath;
    let brokingKey;

    function createGameHost() {
        host.start({
            debug: 2,
            host: brokingHost,
            port: brokingPort,
            path: brokingPath,
            key: brokingKey,
        }).then((id) => {
            hostId = id;
            dispatch('createdHost', id);
        });

        host.players$.subscribe((p) => {
            players = p;
        });
    }

    function restartGame() {
        host.resetGame();
    }

    function onGameCreated(event) {
        host.startGame(event.detail);
    }

    function removePlayer(player) {
        host.removePlayer(player);
    }

    function generateUrlParam(key, value) {
        if (value) {
            return `&${key}=${value}`;
        }
        return '';
    }

    $: sharableLink =
        window.location.origin +
        '/?game=' +
        hostId +
        generateUrlParam('brokingHost', brokingHost) +
        generateUrlParam('brokingPort', brokingPort) +
        generateUrlParam('brokingPath', brokingPath) +
        generateUrlParam('brokingKey', brokingKey);

    function copyLink() {
        navigator.clipboard.writeText(sharableLink);
    }
</script>

<h1>Host</h1>

{#if !hostId}
    <button on:click={createGameHost}>Créer un serveur hôte et démarrer la partie</button>
    <h2>Configurer le serveur</h2>
    <label for="brokingHost">Host</label>
    <input id="brokingHost" bind:value={brokingHost} />
    <label for="brokingPort">Port</label>
    <input id="brokingPort" bind:value={brokingPort} />
    <label for="brokingPath">Path</label>
    <input id="brokingPath" bind:value={brokingPath} />
    <label for="brokingKey">Key</label>
    <input id="brokingKey" bind:value={brokingKey} />
{:else}
    <button on:click={restartGame}>Redémarrer le jeu</button>
    <p>
        Partagez ce lien aux joueurs :
        <a href={sharableLink} target="_blank">{sharableLink}</a>
        <br />
        <button on:click={copyLink}>Copier le lien</button>
    </p>

    <h2>Liste des joueurs</h2>

    <table>
        <tbody>
            {#each players as player}
                <tr>
                    <td>{player.name}</td>
                    <td on:click={() => removePlayer(player)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" viewBox="0 0 16 16">
                            <path
                                d="M.293.293a1 1 0 0 1 1.414 0L8 6.586l6.293-6.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z"
                            />
                        </svg>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <h2>Création de la partie</h2>
    <GameCreationForm {players} on:gameCreated={onGameCreated} />
{/if}

<style>
    table {
        border-collapse: collapse;
    }

    td {
        border: 1px solid white;
        padding: 0.5rem 1rem;
    }

    td:last-child {
        cursor: pointer;
    }
</style>
