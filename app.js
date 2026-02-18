/* Debate Timer – Setup Screen Logic */

(function () {
  "use strict";

  // --- Pre-configured participants ---
  // Edit this array to pre-populate the participant list on page load.
  // Leave empty [] to start with a blank list (default behaviour).
  var INITIAL_PARTICIPANTS = [
    "María García",
    "James Chen",
    "Aisha Patel",
    "Liam O'Brien",
    "Yuki Tanaka",
    "Fatima Al-Rashid",
    "André Dupont",
    "Priya Sharma",
    "Oluwaseun Adeyemi",
    "Sofia Rossi",
    "Kenji Watanabe",
    "Elena Petrova",
    "Mohammed Hassan",
    "Ingrid Johansson",
    "Carlos Mendoza",
    "Mei-Ling Wu",
    "David Okafor",
    "Anastasia Volkov",
    "Raj Krishnamurthy",
    "Emma Larsson",
    "Tomás Herrera",
    "Nadia Benali",
    "Seo-Yeon Kim",
    "Lucas Müller",
    "Amara Diallo",
    "Hiroshi Nakamura",
    "Isabella Santos",
    "Kwame Asante",
    "Chloe Dubois",
    "Arjun Reddy"
  ];

  // --- State ---
  var participants = [];
  var teamAssignments = null; // null when no teams assigned, otherwise { teamA: [...], teamB: [...], interleaved: [{name, team}] }
  var debateInProgress = false;

  // --- DOM refs ---
  var participantInput = document.getElementById("participant-input");
  var addBtn           = document.getElementById("add-btn");
  var participantList  = document.getElementById("participant-list");
  var minutesInput     = document.getElementById("time-minutes");
  var secondsInput     = document.getElementById("time-seconds");
  var startBtn         = document.getElementById("start-btn");
  var randomizeBtn     = document.getElementById("randomize-btn");
  var teamPreview      = document.getElementById("team-preview");
  var downloadTeamsBtn = document.getElementById("download-teams-btn");
  var uploadTeamsBtn   = document.getElementById("upload-teams-btn");
  var uploadTeamsInput = document.getElementById("upload-teams-input");

  // --- Helpers ---

  function getTotalSeconds() {
    var m = parseInt(minutesInput.value, 10) || 0;
    var s = parseInt(secondsInput.value, 10) || 0;
    return m * 60 + s;
  }

  function updateStartButton() {
    startBtn.disabled = participants.length === 0 || getTotalSeconds() <= 0 || teamAssignments === null;
  }

  function updateRandomizeButton() {
    randomizeBtn.disabled = participants.length < 2;
  }

  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function randomizeTeams() {
    var shuffled = shuffleArray(participants.slice());
    var half = Math.ceil(shuffled.length / 2);
    var teamA = shuffled.slice(0, half);
    var teamB = shuffled.slice(half);

    // Build interleaved order
    var interleaved = [];
    var maxLen = Math.max(teamA.length, teamB.length);
    for (var i = 0; i < maxLen; i++) {
      if (i < teamA.length) interleaved.push({ name: teamA[i], team: "Team A" });
      if (i < teamB.length) interleaved.push({ name: teamB[i], team: "Team B" });
    }

    teamAssignments = { teamA: teamA, teamB: teamB, interleaved: interleaved };
    renderTeamPreview();
    updateStartButton();
  }

  function renderTeamPreview() {
    if (!teamAssignments) {
      teamPreview.classList.add("hidden");
      teamPreview.innerHTML = "";
      downloadTeamsBtn.classList.add("hidden");
      return;
    }
    teamPreview.classList.remove("hidden");
    downloadTeamsBtn.classList.remove("hidden");
    teamPreview.innerHTML = "";

    var teams = [
      { label: "Team A", members: teamAssignments.teamA },
      { label: "Team B", members: teamAssignments.teamB }
    ];

    teams.forEach(function (team) {
      var col = document.createElement("div");
      col.className = "team-column";

      var h3 = document.createElement("h3");
      h3.textContent = team.label;
      col.appendChild(h3);

      var ol = document.createElement("ol");
      team.members.forEach(function (name) {
        var li = document.createElement("li");
        li.textContent = name;
        ol.appendChild(li);
      });
      col.appendChild(ol);
      teamPreview.appendChild(col);
    });
  }

  function clearTeamAssignments() {
    teamAssignments = null;
    renderTeamPreview();
  }

  // --- Render participant list ---

  function renderList() {
    participantList.innerHTML = "";
    participants.forEach(function (name, i) {
      var li = document.createElement("li");

      var nameSpan = document.createElement("span");
      nameSpan.className = "name";
      nameSpan.textContent = name;
      li.appendChild(nameSpan);

      // Edit button
      var editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.className = "edit-btn";
      editBtn.title = "Edit";
      editBtn.setAttribute("aria-label", "Edit " + name);
      editBtn.addEventListener("click", function () { editParticipant(i, li); });
      li.appendChild(editBtn);

      // Up button
      var upBtn = document.createElement("button");
      upBtn.textContent = "▲";
      upBtn.title = "Move up";
      upBtn.disabled = i === 0;
      upBtn.setAttribute("aria-label", "Move " + name + " up");
      upBtn.addEventListener("click", function () { moveParticipant(i, -1); });
      li.appendChild(upBtn);

      // Down button
      var downBtn = document.createElement("button");
      downBtn.textContent = "▼";
      downBtn.title = "Move down";
      downBtn.disabled = i === participants.length - 1;
      downBtn.setAttribute("aria-label", "Move " + name + " down");
      downBtn.addEventListener("click", function () { moveParticipant(i, 1); });
      li.appendChild(downBtn);

      // Remove button
      var removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.className = "remove-btn";
      removeBtn.title = "Remove";
      removeBtn.setAttribute("aria-label", "Remove " + name);
      removeBtn.addEventListener("click", function () { removeParticipant(i); });
      li.appendChild(removeBtn);

      participantList.appendChild(li);
    });
    updateStartButton();
    updateRandomizeButton();
    clearTeamAssignments();
  }

  // --- Participant actions ---

  function addParticipant() {
    var name = participantInput.value.trim();
    if (!name) return;
    participants.push(name);
    participantInput.value = "";
    participantInput.focus();
    renderList();
  }

  function removeParticipant(index) {
    participants.splice(index, 1);
    renderList();
  }

  function moveParticipant(index, direction) {
    var target = index + direction;
    if (target < 0 || target >= participants.length) return;
    var temp = participants[index];
    participants[index] = participants[target];
    participants[target] = temp;
    renderList();
  }

  function editParticipant(index, li) {
    var currentName = participants[index];
    var nameSpan = li.querySelector(".name");

    // Replace name span with an input
    var input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = currentName;
    input.setAttribute("aria-label", "Edit participant name");

    // Save button
    var saveBtn = document.createElement("button");
    saveBtn.textContent = "✓";
    saveBtn.className = "save-btn";
    saveBtn.title = "Save";
    saveBtn.setAttribute("aria-label", "Save name");

    // Hide the name span and other buttons
    nameSpan.style.display = "none";
    var buttons = li.querySelectorAll("button");
    buttons.forEach(function (btn) { btn.style.display = "none"; });

    // Insert input and save button after the hidden name span
    li.insertBefore(input, nameSpan.nextSibling);
    li.insertBefore(saveBtn, input.nextSibling);

    input.focus();
    input.select();

    function confirmEdit() {
      var newName = input.value.trim();
      if (newName && newName !== currentName) {
        participants[index] = newName;
        clearTeamAssignments();
      }
      renderList();
    }

    function cancelEdit() {
      renderList();
    }

    saveBtn.addEventListener("click", confirmEdit);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); confirmEdit(); }
      if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
    });
    input.addEventListener("blur", function (e) {
      // If focus moved to the save button, don't cancel
      if (e.relatedTarget === saveBtn) return;
      cancelEdit();
    });
  }

  // --- Event listeners ---

  addBtn.addEventListener("click", addParticipant);

  participantInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addParticipant(); }
  });

  minutesInput.addEventListener("input", updateStartButton);
  secondsInput.addEventListener("input", updateStartButton);

  // Clamp seconds 0-59 on blur
  secondsInput.addEventListener("blur", function () {
    var v = parseInt(secondsInput.value, 10);
    if (isNaN(v) || v < 0) secondsInput.value = 0;
    else if (v > 59) secondsInput.value = 59;
    updateStartButton();
  });

  // Clamp minutes 0-99 on blur
  minutesInput.addEventListener("blur", function () {
    var v = parseInt(minutesInput.value, 10);
    if (isNaN(v) || v < 0) minutesInput.value = 0;
    else if (v > 99) minutesInput.value = 99;
    updateStartButton();
  });

  randomizeBtn.addEventListener("click", function () {
    if (participants.length < 2) return;
    randomizeTeams();
  });

  startBtn.addEventListener("click", function () {
    if (participants.length === 0 || getTotalSeconds() <= 0 || !teamAssignments) return;

    // Build participant list with team info (teams are required)
    var speakerList = teamAssignments.interleaved; // [{name, team}]

    // Expose state for the countdown screen
    window.__debateConfig = {
      speakers: speakerList,
      participants: speakerList.map(function (s) { return s.name; }),
      totalSeconds: getTotalSeconds()
    };
    // Hide setup, show countdown
    debateInProgress = true;
    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("countdown-screen").classList.remove("hidden");
    startCountdown();
  });

  // --- Countdown Screen Logic ---

  var countdownScreen = document.getElementById("countdown-screen");
  var endScreen       = document.getElementById("end-screen");
  var speakerNameEl   = document.getElementById("speaker-name");
  var speakerTeamEl   = document.getElementById("speaker-team");
  var timerDisplayEl  = document.getElementById("timer-display");
  var progressTextEl  = document.getElementById("speaker-progress-text");
  var nextBtn         = document.getElementById("next-btn");
  var restartBtn      = document.getElementById("restart-btn");
  var nextUpEl        = document.getElementById("next-up-text");
  var pauseBtn        = document.getElementById("pause-btn");
  var skipBtn         = document.getElementById("skip-btn");
  var countdownRestartBtn = document.getElementById("countdown-restart-btn");

  var currentIndex = 0;
  var remaining = 0;
  var totalTime = 0;
  var timerInterval = null;
  var paused = false;

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function formatTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return pad(m) + ":" + pad(s);
  }

  function startCountdown() {
    var config = window.__debateConfig;
    currentIndex = 0;
    totalTime = config.totalSeconds;
    showSpeaker();
  }

  function showSpeaker() {
    var config = window.__debateConfig;
    var speaker = config.speakers[currentIndex];
    var name = speaker.name;

    speakerNameEl.textContent = name;

    // Show team label if teams are assigned
    if (speaker.team) {
      speakerTeamEl.textContent = speaker.team;
      speakerTeamEl.style.display = "";
    } else {
      speakerTeamEl.textContent = "";
      speakerTeamEl.style.display = "none";
    }

    progressTextEl.textContent = "Speaker " + (currentIndex + 1) + " of " + config.speakers.length;
    remaining = totalTime;
    timerDisplayEl.textContent = formatTime(remaining);

    // Update "next up" display
    if (currentIndex < config.speakers.length - 1) {
      var nextSpeaker = config.speakers[currentIndex + 1];
      var nextLabel = nextSpeaker.team
        ? "Next: " + nextSpeaker.team + " — " + nextSpeaker.name
        : "Next: " + nextSpeaker.name;
      nextUpEl.textContent = nextLabel;
    } else {
      nextUpEl.textContent = "Last speaker";
    }

    // Reset warning state
    countdownScreen.classList.remove("warning");

    // Hide next button, show pause and skip buttons
    nextBtn.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    skipBtn.classList.remove("hidden");
    paused = false;
    pauseBtn.textContent = "Pause";

    // Start ticking
    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
  }

  function tick() {
    remaining--;

    if (remaining < 0) remaining = 0;
    timerDisplayEl.textContent = formatTime(remaining);

    // Warning: when ≤10% of time remains
    var threshold = Math.ceil(totalTime * 0.1);
    if (remaining <= threshold && remaining > 0) {
      countdownScreen.classList.add("warning");
    }

    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      countdownScreen.classList.add("warning");
      nextBtn.classList.remove("hidden");
      pauseBtn.classList.add("hidden");
      skipBtn.classList.add("hidden");

      // Change button text for last speaker
      var config = window.__debateConfig;
      if (currentIndex >= config.speakers.length - 1) {
        nextBtn.textContent = "Finish";
      } else {
        nextBtn.textContent = "Next Speaker";
      }
    }
  }

  pauseBtn.addEventListener("click", function () {
    if (paused) {
      // Resume
      timerInterval = setInterval(tick, 1000);
      paused = false;
      pauseBtn.textContent = "Pause";
    } else {
      // Pause
      clearInterval(timerInterval);
      timerInterval = null;
      paused = true;
      pauseBtn.textContent = "Resume";
    }
  });

  skipBtn.addEventListener("click", function () {
    // Stop the current timer immediately
    clearInterval(timerInterval);
    timerInterval = null;
    paused = false;

    var config = window.__debateConfig;
    currentIndex++;

    if (currentIndex >= config.speakers.length) {
      // Last speaker — go to end screen
      countdownScreen.classList.add("hidden");
      countdownScreen.classList.remove("warning");
      endScreen.classList.remove("hidden");
    } else {
      showSpeaker();
    }
  });

  nextBtn.addEventListener("click", function () {
    var config = window.__debateConfig;
    currentIndex++;

    if (currentIndex >= config.speakers.length) {
      // All done — show end screen
      countdownScreen.classList.add("hidden");
      countdownScreen.classList.remove("warning");
      endScreen.classList.remove("hidden");
    } else {
      showSpeaker();
    }
  });

  restartBtn.addEventListener("click", function () {
    // Return to setup with previous data intact
    clearInterval(timerInterval);
    timerInterval = null;
    paused = false;
    debateInProgress = false;
    endScreen.classList.add("hidden");
    countdownScreen.classList.add("hidden");
    countdownScreen.classList.remove("warning");
    document.getElementById("setup-screen").classList.remove("hidden");
  });

  countdownRestartBtn.addEventListener("click", function () {
    // Stop timer and return to setup with all data intact (participants, teams, time)
    clearInterval(timerInterval);
    timerInterval = null;
    paused = false;
    debateInProgress = false;
    countdownScreen.classList.add("hidden");
    countdownScreen.classList.remove("warning");
    document.getElementById("setup-screen").classList.remove("hidden");
  });

  // --- Download Teams ---

  downloadTeamsBtn.addEventListener("click", function () {
    if (!teamAssignments) return;

    var teamANames = teamAssignments.teamA.join(", ");
    var teamBNames = teamAssignments.teamB.join(", ");
    var speakingOrder = teamAssignments.interleaved.map(function (s) {
      var letter = s.team === "Team A" ? "A" : "B";
      return s.name + " (" + letter + ")";
    }).join(", ");

    var content = "Team A: " + teamANames + "\n" +
                  "Team B: " + teamBNames + "\n" +
                  "Speaking Order: " + speakingOrder;

    var blob = new Blob([content], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "debate-teams.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // --- Upload Teams ---

  uploadTeamsBtn.addEventListener("click", function () {
    uploadTeamsInput.value = "";
    uploadTeamsInput.click();
  });

  uploadTeamsInput.addEventListener("change", function () {
    var file = uploadTeamsInput.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
      var text = e.target.result;
      var lines = text.split("\n");

      var teamANames = [];
      var teamBNames = [];
      var interleaved = [];

      lines.forEach(function (line) {
        line = line.trim();
        if (line.indexOf("Team A:") === 0) {
          teamANames = line.substring(7).split(",").map(function (n) { return n.trim(); }).filter(Boolean);
        } else if (line.indexOf("Team B:") === 0) {
          teamBNames = line.substring(7).split(",").map(function (n) { return n.trim(); }).filter(Boolean);
        } else if (line.indexOf("Speaking Order:") === 0) {
          var orderStr = line.substring(15);
          var entries = orderStr.split(",").map(function (n) { return n.trim(); }).filter(Boolean);
          entries.forEach(function (entry) {
            // Parse "Name (A)" or "Name (B)"
            var match = entry.match(/^(.+?)\s*\(([AB])\)$/);
            if (match) {
              interleaved.push({ name: match[1].trim(), team: "Team " + match[2] });
            }
          });
        }
      });

      if (teamANames.length === 0 && teamBNames.length === 0) return;

      // Reconstruct participants from both teams
      participants = teamANames.concat(teamBNames);

      // If no speaking order was parsed, build one from teams
      if (interleaved.length === 0) {
        var maxLen = Math.max(teamANames.length, teamBNames.length);
        for (var i = 0; i < maxLen; i++) {
          if (i < teamANames.length) interleaved.push({ name: teamANames[i], team: "Team A" });
          if (i < teamBNames.length) interleaved.push({ name: teamBNames[i], team: "Team B" });
        }
      }

      teamAssignments = { teamA: teamANames, teamB: teamBNames, interleaved: interleaved };

      // Re-render participant list without clearing team assignments
      participantList.innerHTML = "";
      participants.forEach(function (name, i) {
        var li = document.createElement("li");

        var nameSpan = document.createElement("span");
        nameSpan.className = "name";
        nameSpan.textContent = name;
        li.appendChild(nameSpan);

        // Edit button
        var editBtnEl = document.createElement("button");
        editBtnEl.textContent = "✏️";
        editBtnEl.className = "edit-btn";
        editBtnEl.title = "Edit";
        editBtnEl.setAttribute("aria-label", "Edit " + name);
        editBtnEl.addEventListener("click", function () { editParticipant(i, li); });
        li.appendChild(editBtnEl);

        // Up button
        var upBtn = document.createElement("button");
        upBtn.textContent = "▲";
        upBtn.title = "Move up";
        upBtn.disabled = i === 0;
        upBtn.setAttribute("aria-label", "Move " + name + " up");
        upBtn.addEventListener("click", function () { moveParticipant(i, -1); });
        li.appendChild(upBtn);

        // Down button
        var downBtn = document.createElement("button");
        downBtn.textContent = "▼";
        downBtn.title = "Move down";
        downBtn.disabled = i === participants.length - 1;
        downBtn.setAttribute("aria-label", "Move " + name + " down");
        downBtn.addEventListener("click", function () { moveParticipant(i, 1); });
        li.appendChild(downBtn);

        // Remove button
        var removeBtn = document.createElement("button");
        removeBtn.textContent = "✕";
        removeBtn.className = "remove-btn";
        removeBtn.title = "Remove";
        removeBtn.setAttribute("aria-label", "Remove " + name);
        removeBtn.addEventListener("click", function () { removeParticipant(i); });
        li.appendChild(removeBtn);

        participantList.appendChild(li);
      });

      renderTeamPreview();
      updateStartButton();
      updateRandomizeButton();
    };
    reader.readAsText(file);
  });

  // --- Warn before page reload ---

  window.addEventListener("beforeunload", function (e) {
    if (participants.length > 0 || debateInProgress) {
      e.preventDefault();
    }
  });

  // --- Init ---

  // Pre-populate participants from the INITIAL_PARTICIPANTS array
  INITIAL_PARTICIPANTS.forEach(function (name) {
    var trimmed = name.trim();
    if (trimmed) {
      participants.push(trimmed);
    }
  });
  if (participants.length > 0) {
    renderList();
  }

  updateStartButton();
  updateRandomizeButton();
})();

