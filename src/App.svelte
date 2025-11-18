<script>
    import Host from './host/Host.svelte';
    import Game from './game/Game.svelte';

    let hostId = null;
    if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('game')) {
            hostId = urlParams.get('game');
        }
    }

    let gameCreator = false;

    function onCreatedHost(ev) {
        gameCreator = true;
        hostId = ev.detail;
    }
</script>

<div class="container">
    {#if !hostId || gameCreator}
        <div class="host-section">
            <Host on:createdHost={onCreatedHost} />
        </div>
    {/if}

    {#if hostId}
        <div class="flex-1">
            <Game {hostId} />
        </div>
    {/if}
</div>

<style>
    .container {
        height: 100%;
        width: 100%;
    }
    .container div {
        padding: 10px;
    }
    .flex-1 {
        flex: 1;
    }
</style>
