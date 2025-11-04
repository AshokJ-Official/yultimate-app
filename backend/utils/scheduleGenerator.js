// Tournament schedule generation utilities

// Generate round-robin schedule
const generateRoundRobinSchedule = (teams, fields, startDate, matchDuration = 90) => {
  const matches = [];
  const numTeams = teams.length;
  const numRounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
  const matchesPerRound = Math.floor(numTeams / 2);
  
  // Create team array with bye if odd number of teams
  const teamArray = [...teams];
  if (numTeams % 2 === 1) {
    teamArray.push(null); // Bye team
  }
  
  let currentDate = new Date(startDate);
  let currentTime = new Date(currentDate);
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM
  
  for (let round = 0; round < numRounds; round++) {
    const roundMatches = [];
    
    for (let match = 0; match < matchesPerRound; match++) {
      const team1Index = match;
      const team2Index = teamArray.length - 1 - match;
      
      const team1 = teamArray[team1Index];
      const team2 = teamArray[team2Index];
      
      // Skip if either team is bye
      if (team1 && team2) {
        const field = fields[match % fields.length];
        const matchTime = new Date(currentTime);
        
        roundMatches.push({
          teamA: team1._id,
          teamB: team2._id,
          field: field.name,
          scheduledTime: matchTime,
          round: `Round ${round + 1}`
        });
        
        // Increment time for next match on same field
        if (match % fields.length === fields.length - 1) {
          currentTime.setMinutes(currentTime.getMinutes() + matchDuration);
        }
      }
    }
    
    matches.push(...roundMatches);
    
    // Rotate teams (keep first team fixed)
    const lastTeam = teamArray.pop();
    teamArray.splice(1, 0, lastTeam);
    
    // Reset time for next round
    if (round < numRounds - 1) {
      currentTime = new Date(currentDate);
      currentTime.setHours(9, 0, 0, 0);
      
      // Move to next day if too many matches
      if (roundMatches.length > fields.length * 6) { // Max 6 time slots per day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }
  
  return matches;
};

// Generate bracket/elimination schedule
const generateBracketSchedule = (teams, fields, startDate, matchDuration = 90) => {
  const matches = [];
  const numTeams = teams.length;
  
  // Calculate number of rounds needed
  const numRounds = Math.ceil(Math.log2(numTeams));
  
  let currentRoundTeams = [...teams];
  let currentDate = new Date(startDate);
  let roundNumber = 1;
  
  while (currentRoundTeams.length > 1) {
    const roundMatches = [];
    const nextRoundTeams = [];
    
    let currentTime = new Date(currentDate);
    currentTime.setHours(9, 0, 0, 0);
    
    // Pair teams for matches
    for (let i = 0; i < currentRoundTeams.length; i += 2) {
      if (i + 1 < currentRoundTeams.length) {
        const team1 = currentRoundTeams[i];
        const team2 = currentRoundTeams[i + 1];
        const field = fields[(i / 2) % fields.length];
        
        const matchTime = new Date(currentTime);
        matchTime.setMinutes(matchTime.getMinutes() + Math.floor(i / 2 / fields.length) * matchDuration);
        
        roundMatches.push({
          teamA: team1._id,
          teamB: team2._id,
          field: field.name,
          scheduledTime: matchTime,
          round: getRoundName(roundNumber, numRounds)
        });
        
        // For bracket, we don't know the winner yet, so we'll handle this in the frontend
        // or create placeholder teams for next round
      } else {
        // Odd team gets a bye
        nextRoundTeams.push(currentRoundTeams[i]);
      }
    }
    
    matches.push(...roundMatches);
    
    // Move to next round
    currentRoundTeams = nextRoundTeams;
    roundNumber++;
    
    // Move to next day for next round
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return matches;
};

// Get round name for bracket tournaments
const getRoundName = (roundNumber, totalRounds) => {
  const roundsFromEnd = totalRounds - roundNumber + 1;
  
  switch (roundsFromEnd) {
    case 1: return 'Final';
    case 2: return 'Semi-Final';
    case 3: return 'Quarter-Final';
    default: return `Round ${roundNumber}`;
  }
};

// Generate Swiss system schedule
const generateSwissSchedule = (teams, fields, startDate, numRounds, matchDuration = 90) => {
  const matches = [];
  
  // Swiss system is complex and typically requires dynamic pairing
  // This is a simplified version
  let currentDate = new Date(startDate);
  
  for (let round = 0; round < numRounds; round++) {
    const roundMatches = [];
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    let currentTime = new Date(currentDate);
    currentTime.setHours(9, 0, 0, 0);
    
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      if (i + 1 < shuffledTeams.length) {
        const team1 = shuffledTeams[i];
        const team2 = shuffledTeams[i + 1];
        const field = fields[(i / 2) % fields.length];
        
        const matchTime = new Date(currentTime);
        matchTime.setMinutes(matchTime.getMinutes() + Math.floor(i / 2 / fields.length) * matchDuration);
        
        roundMatches.push({
          teamA: team1._id,
          teamB: team2._id,
          field: field.name,
          scheduledTime: matchTime,
          round: `Round ${round + 1}`
        });
      }
    }
    
    matches.push(...roundMatches);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return matches;
};

// Optimize schedule for field usage
const optimizeSchedule = (matches, fields) => {
  // Sort matches by time
  matches.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  
  // Redistribute matches across fields to minimize gaps
  const fieldSchedules = {};
  fields.forEach(field => {
    fieldSchedules[field.name] = [];
  });
  
  matches.forEach(match => {
    fieldSchedules[match.field].push(match);
  });
  
  // Balance the load across fields
  const fieldNames = Object.keys(fieldSchedules);
  const totalMatches = matches.length;
  const matchesPerField = Math.ceil(totalMatches / fieldNames.length);
  
  // Redistribute if needed
  fieldNames.forEach(fieldName => {
    const fieldMatches = fieldSchedules[fieldName];
    if (fieldMatches.length > matchesPerField) {
      // Move excess matches to less loaded fields
      const excess = fieldMatches.splice(matchesPerField);
      excess.forEach(match => {
        // Find field with least matches
        const leastLoadedField = fieldNames.reduce((min, field) => 
          fieldSchedules[field].length < fieldSchedules[min].length ? field : min
        );
        match.field = leastLoadedField;
        fieldSchedules[leastLoadedField].push(match);
      });
    }
  });
  
  return matches;
};

module.exports = {
  generateRoundRobinSchedule,
  generateBracketSchedule,
  generateSwissSchedule,
  optimizeSchedule
};