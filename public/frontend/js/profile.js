document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Number Counter Animation for Stats
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach(stat => {
    const target = parseInt(stat.textContent, 10);
    let current = 0;
    // Calculate increment step to ensure all animations finish around the same time
    const increment = Math.ceil(target / 40); 
    
    // Clear initial text to start at 0
    stat.textContent = '0';
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target; // Ensure it ends exactly on the target
        clearInterval(timer);
      } else {
        stat.textContent = current;
      }
    }, 25); // Run every 25ms
  });

  // 2. Tab Switching Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const postFeed = document.querySelector('.post-feed');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Ignore if already active
      if (btn.classList.contains('active')) return;

      // Swap active classes
      tabBtns.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      // Simulate network request / visual transition
      postFeed.style.transition = 'opacity 0.2s ease';
      postFeed.style.opacity = '0.3';
      
      setTimeout(() => {
        postFeed.style.opacity = '1';
        // Note: In a real app with a backend, you would fetch and render 
        // the "Saved" or "My Posts" data array right here!
      }, 250);
    });
  });

  // 3. Reaction Button Toggling
  const reactionBtns = document.querySelectorAll('.reaction-btn');

  reactionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const counterSpan = this.querySelector('span');
      let currentCount = parseInt(counterSpan.textContent, 10);

      if (this.classList.contains('active')) {
        // Remove reaction
        this.classList.remove('active');
        counterSpan.textContent = currentCount - 1;
      } else {
        // Add reaction
        this.classList.add('active');
        counterSpan.textContent = currentCount + 1;
      }
      
      // Add a tiny pop animation to the button itself
      this.style.transform = 'scale(1.1)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
    });
  });

  // 4. Pet Avatar Easter Egg (Bouncy Interaction)
  const petAvatar = document.querySelector('.pet-avatar-container');
  
  petAvatar.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  petAvatar.style.cursor = 'pointer';

  petAvatar.addEventListener('click', () => {
    // Squish down
    petAvatar.style.transform = 'scale(0.9) translateY(5px)';
    
    setTimeout(() => {
      // Pop back up
      petAvatar.style.transform = 'scale(1.05) translateY(-5px)';
      
      setTimeout(() => {
        // Settle to normal
        petAvatar.style.transform = 'scale(1) translateY(0)';
      }, 150);
    }, 100);
  });

});