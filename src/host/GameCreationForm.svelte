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
  let availableDecks = []
  let deck = 'base'
  let allCards

  cardsStore.subscribe(c => {
    allCards = c;
    availableDecks = Object.keys(c)
    if (availableDecks.length > 0) {
      playableCards = allCards['base']
      cards = allCards['base']
    }
  })

  function handleDeckChange() {
    cards = allCards[deck]
    if (!localStorage.getItem('removedCards')) {
      playableCards = [...cards];
    } else {
      const removedCardsNames = JSON.parse(localStorage.getItem('removedCards'));
      playableCards = cards.filter(card => !removedCardsNames.includes(card.name));
    }
    console.log('change', playableCards)
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
    console.log('sub', playableCards)
    dispatch('gameCreated', {
      shadowHunters,
      cards: playableCards,
      preventReplayingSameCards
    })

  }

  function toggleCard(card) {
    if (playableCards.findIndex(c => c.name === card.name) > -1) {
      playableCards.splice(playableCards.findIndex(c => c.name === card.name), 1);
      playableCards = [...playableCards];
    } else {
      playableCards = [...playableCards, card];
    }
    localStorage.setItem(
      'removedCards',
      JSON.stringify(cards.map(c => c.name).filter(cardName => !playableCards.map(c => c.name).includes(cardName)))
    );
  }
</script>

<style>
    .inline {
        display: inline-block;
    }

    .medium-card {
        width: 300px;
        display: inline-block;
    }

    .removed-card {
        opacity: 0.6;
    }
</style>

<p>Nombre de joueurs : {players.length}</p>

<form>
    <div>
        <label class="inline">Shadow & Hunters count</label>
        <select bind:value={shadowHunters} class="inline">
            {#each shadowHuntersChoices as choice}
                <option value={choice}>{choice}</option>
            {/each}
        </select>
    </div>

    <div>
        <label class="inline">Neutral count</label>
        <span>{neutrals}</span>
    </div>

    <div>
        <label class="inline">Ne pas rejouer les mêmes personnages 2 fois de suite</label>
        <input type="checkbox" bind:checked={preventReplayingSameCards}>
    </div>

    <div>
        <label class="inline">Deck à utiliser :</label>
        <select bind:value={deck} on:change={handleDeckChange} class="inline">
            {#if availableDecks}
                {#each availableDecks as choice}
                    <option value={choice}>{choice}</option>
                {/each}
            {/if}
        </select>
    </div>

    <button type="button" on:click={submit}>Start game !</button>

    <h2>Liste des personnages <i class="{showCards ? 'gg-chevron-down' : 'gg-chevron-up'}" on:click={() => showCards = !showCards}></i></h2>
    <div style="display: flex; flex-wrap: wrap; justify-content: space-around;">
        {#if showCards}
            {#each cards as card}
                <div
                        style="max-width: calc((100% - 10px) / 4)"
                        class="medium-card"
                        on:click={() => toggleCard(card)}
                        class:removed-card={playableCards.findIndex(c => c.name === card.name) === -1}>
                    <Card {card}/>
                </div>
            {/each}
        {/if}
    </div>
</form>
