<script>
    import { createEventDispatcher } from 'svelte';
    import { cardsStore } from '../cards-store';
    import Card from '../display/Card.svelte';
    export let players = [];

    const dispatch = createEventDispatcher();

    let shadowHunters;
    let shadowHuntersChoices;
    let cards = [];
    let playableCards = [];
    let showCards = true;
    let preventReplayingSameCards = true;
    let availableDecks = [];
    let deck = 'base';
    let allCards;

    cardsStore.subscribe((c) => {
        allCards = c;
        availableDecks = Object.keys(c);
        if (availableDecks.length > 0) {
            playableCards = allCards['base'];
            cards = allCards['base'];
        }
    });

    function handleDeckChange() {
        cards = allCards[deck];
        if (!localStorage.getItem('removedCards')) {
            playableCards = [...cards];
        } else {
            const removedCardsNames = JSON.parse(localStorage.getItem('removedCards'));
            playableCards = cards.filter((card) => !removedCardsNames.includes(card.name));
        }
        console.log('change', playableCards);
    }

    $: neutrals = players.length - shadowHunters * 2;

    $: {
        players;
        playersUpdated();
    }

    function playersUpdated() {
        shadowHuntersChoices = [...Array(Math.floor(players.length / 2) + 1).keys()];
    }

    function submit() {
        console.log('sub', playableCards);
        dispatch('gameCreated', {
            shadowHunters,
            cards: playableCards,
            preventReplayingSameCards,
        });
    }

    function toggleCard(card) {
        if (playableCards.findIndex((c) => c.name === card.name) > -1) {
            playableCards.splice(
                playableCards.findIndex((c) => c.name === card.name),
                1
            );
            playableCards = [...playableCards];
        } else {
            playableCards = [...playableCards, card];
        }
        localStorage.setItem(
            'removedCards',
            JSON.stringify(
                cards.map((c) => c.name).filter((cardName) => !playableCards.map((c) => c.name).includes(cardName))
            )
        );
    }
</script>

<p>Nombre de joueurs : {players.length}</p>

<form>
    <div>
        <label for="shadowHunters" class="inline">Nombre de Shadow & Hunters</label>
        <select id="shadowHunters" bind:value={shadowHunters} class="inline">
            {#each shadowHuntersChoices as choice}
                <option value={choice}>{choice}</option>
            {/each}
        </select>
    </div>

    <div>
        <p class="inline">Nombre de Neutres :</p>
        <span>{neutrals}</span>
    </div>

    <div>
        <label for="preventReplayingSameCards" class="inline">
            Ne pas rejouer les mêmes personnages 2 fois de suite
        </label>
        <input id="preventReplayingSameCards" type="checkbox" bind:checked={preventReplayingSameCards} />
    </div>

    <div>
        <label for="handleDeckChange" class="inline">Deck à utiliser :</label>
        <select id="handleDeckChange" bind:value={deck} on:change={handleDeckChange} class="inline">
            {#if availableDecks}
                {#each availableDecks as choice}
                    <option value={choice}>{choice}</option>
                {/each}
            {/if}
        </select>
    </div>

    <button type="button" on:click={submit}>Commencer le jeu !</button>

    <h2>
        Liste des personnages
        <button type="button" on:click={() => (showCards = !showCards)} class="medium-card">
            {#if showCards}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path
                        fill-rule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                    />
                </svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path
                        fill-rule="evenodd"
                        d="M1.646 11.354a.5.5 0 0 0 .708 0L8 5.707l5.646 5.647a.5.5 0 0 0 .708-.708l-6-6a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 0 .708z"
                    />
                </svg>
            {/if}
        </button>
    </h2>
    <div class="list-cards">
        {#if showCards}
            {#each cards as card}
                <button
                    type="button"
                    class="medium-card"
                    on:click={() => toggleCard(card)}
                    class:removed-card={playableCards.findIndex((c) => c.name === card.name) === -1}
                >
                    <Card {card} />
                </button>
            {/each}
        {/if}
    </div>
</form>

<style>
    .inline {
        display: inline-block;
    }

    .list-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 10px;
    }

    .medium-card {
        width: 300px;
        display: inline-block;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-align: left;
    }

    .removed-card {
        opacity: 0.6;
    }
</style>
