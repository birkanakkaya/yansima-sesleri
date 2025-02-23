const Logger = {
  container: null,
  maxLogs: 100,
  
  init() {
    this.container = document.getElementById('log-content');
    document.getElementById('clear-logs').addEventListener('click', () => this.clear());
  },

  log(message, type = 'info') {
    // Log to console
    console.log(message);
    
    // Create log entry element
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    // Add to container
    this.container.appendChild(entry);
    
    // Scroll to bottom
    this.container.scrollTop = this.container.scrollHeight;
    
    // Limit number of logs
    while (this.container.children.length > this.maxLogs) {
      this.container.removeChild(this.container.firstChild);
    }
  },

  error(message) {
    this.log(message, 'error');
    console.error(message);
  },

  warn(message) {
    this.log(message, 'warn');
    console.warn(message);
  },

  clear() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Logger.init();
  
  const buttons = document.querySelectorAll('.sound-button');
  const activeSounds = new Map();

  // Log initial setup
  Logger.log('Sound board initialized');
  Logger.log(`Found ${buttons.length} sound buttons`);

  document.getElementById('start').addEventListener('click', () => {
    Logger.log('Audio context unlocked');
  });

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const soundFile = button.getAttribute('data-sound');
      const soundPath = `sounds/${soundFile}`;
      Logger.log(`Button clicked: "${button.textContent}" (${soundFile})`);

      let audio = activeSounds.get(soundFile);

      if (!audio) {
        try {
          audio = new Audio(soundPath);
          activeSounds.set(soundFile, audio);
          Logger.log(`Created new audio object for: ${soundFile}`);
          
          // Add ended event listener
          audio.addEventListener('ended', () => {
            Logger.log(`Sound completed: ${soundFile}`);
            activeSounds.delete(soundFile);
          });
          
          // Add error event listener
          audio.addEventListener('error', (e) => {
            Logger.error(`Audio error for ${soundFile}: ${e.target.error.message}`);
            activeSounds.delete(soundFile);
          });

        } catch (error) {
          Logger.error(`Failed to create audio object for: ${soundFile}`);
          Logger.error(error.message);
          return;
        }
      }

      // Stop the sound if already playing
      if (!audio.paused) {
        Logger.log(`Stopping current playback: ${soundFile}`);
        audio.pause();
        audio.currentTime = 0;
        activeSounds.delete(soundFile);
        return;
      }

      // Play the sound
      audio.play()
        .then(() => {
          Logger.log(`Successfully playing: ${soundFile}`);
        })
        .catch(err => {
          Logger.error(`Playback failed for: ${soundFile}`);
          Logger.error(err.message);
          activeSounds.delete(soundFile);
        });
    });
  });

  // Log memory usage every 30 seconds
  setInterval(() => {
    Logger.log(`Active sounds in memory: ${activeSounds.size}`);
  }, 30000);
});