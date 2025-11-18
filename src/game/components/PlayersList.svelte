<script>
    export let players = [];
</script>

<h2>Joueurs ({players.length})</h2>
<div class="players">
    {#each players as player}
        <div class="player" id="player-{player.playerId}">
            <p>{player.playerId} - {player.name} - <span>{player.faction}</span></p>
            <img class="limit-width" src="" alt="" />
        </div>
    {/each}
</div>

<style>
    .player {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid grey;
        padding: 1rem;
    }

    .players {
        margin: 0 auto;
        display: grid;
        gap: 1rem;
    }

    @media (min-width: 600px) {
        .players {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (min-width: 900px) {
        .players {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .limit-width {
        max-width: 300px;
    }
</style>
