<script>
    export let players = [];
</script>
<h2>Players ({players.length})</h2>
<div class="players">
    {#each players as player}
    <div class="player" id="player-{player.playerId}">
        <p>{player.playerId} - {player.name} - <span>{player.faction}</span></p>
        <img style="max-width: 300px" src="" alt="">
    </div>
    {/each}
</div>
