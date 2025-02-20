function setupLeaderboard() {
    let panel = createDiv('');
    panel.id('leaderboard');
    
    const container = createDiv('');
    container.parent(panel);
    container.class('leaderboard-container');
    
    const title = createDiv('Leaderboard');
    title.parent(container);
    title.class('leaderboard-title');
    
    // Create empty cards for the top 10 spots
    for(let i = 0; i < 10; i++) {
      const card = createDiv('');
      card.parent(container);
      card.class('card');
      
      const cardTitle = createDiv(`Rank #${i + 1}`);
      cardTitle.parent(card);
      cardTitle.class('card__title');
      
      const cardData = createDiv('');
      cardData.parent(card);
      cardData.class('card__data');
      
      const leftCol = createDiv('');
      leftCol.parent(cardData);
      leftCol.class('card__right');
      
      const rightCol = createDiv('');
      rightCol.parent(cardData);
      rightCol.class('card__left');
      
      // Modified labels - only 3 items now
      const leftLabels = ['Score', 'Mines Flagged', 'Time'];
      leftLabels.forEach(label => {
        const item = createDiv(label);
        item.parent(leftCol);
        item.class('item');
      });
      
      // Modified default values - only 3 items now
      const rightValues = ['--', '--', '--:--'];
      rightValues.forEach(value => {
        const item = createDiv(value);
        item.parent(rightCol);
        item.class('item');
      });
    }
  }

// Updates the leaderboard with actual data
function updateLeaderboard() {
    const entries = JSON.parse(localStorage.getItem('gameEntries')) || [];
    entries.sort((a, b) => b.score - a.score);
    
    //get all cards to update
    const cards = selectAll('.card');
    
    // only display first 10 elements
    entries.slice(0, 10).forEach((entry, index) => {
      if (cards[index]) {
        const rightCol = select('.card__left', cards[index]);
        if (rightCol) {
          const items = selectAll('.item', rightCol);
          
          const minutes = Math.floor(entry.time / 60);
          const seconds = entry.time % 60;
          const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          const values = [
            entry.score.toString(),         
            entry.minesFlagged.toString(),   
            timeFormatted                    
          ];
          items.forEach((item, i) => {
            if (item && values[i] !== undefined) {
              item.html(values[i]);
            }
          });
        }
      }
    });
  }


  function clearLeaderboard() {
    localStorage.removeItem('gameEntries');
    
    const cards = selectAll('.card');
    cards.forEach(card => {
      const rightCol = select('.card__left', card);
      if (rightCol) {
        const items = selectAll('.item', rightCol);
        const defaultValues = ['--', '--', '--:--'];
        items.forEach((item, i) => {
          item.html(defaultValues[i]);
        });
      }
    });
  }