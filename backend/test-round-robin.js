const { generateRoundRobinSchedule } = require('./utils/scheduleGenerator');

// Mock teams data
const teams = [
  { _id: 'team1', name: 'Thunder Bolts' },
  { _id: 'team2', name: 'Lightning Strikes' },
  { _id: 'team3', name: 'Storm Chasers' },
  { _id: 'team4', name: 'Wind Warriors' }
];

// Mock fields data
const fields = [
  { name: 'Field A' },
  { name: 'Field B' }
];

// Generate round-robin schedule
const startDate = new Date('2024-01-15');
const matchDuration = 90; // 90 minutes per match

console.log('🏆 ROUND-ROBIN SCHEDULE GENERATOR TEST\n');
console.log(`Teams: ${teams.map(t => t.name).join(', ')}`);
console.log(`Fields: ${fields.map(f => f.name).join(', ')}`);
console.log(`Start Date: ${startDate.toDateString()}`);
console.log(`Match Duration: ${matchDuration} minutes\n`);

const schedule = generateRoundRobinSchedule(teams, fields, startDate, matchDuration);

console.log('📅 GENERATED SCHEDULE:\n');

// Group matches by round
const rounds = {};
schedule.forEach(match => {
  if (!rounds[match.round]) {
    rounds[match.round] = [];
  }
  rounds[match.round].push(match);
});

Object.keys(rounds).forEach(round => {
  console.log(`\n${round}:`);
  rounds[round].forEach(match => {
    const teamA = teams.find(t => t._id === match.teamA);
    const teamB = teams.find(t => t._id === match.teamB);
    const time = new Date(match.scheduledTime).toLocaleTimeString();
    console.log(`  ${time} | ${match.field} | ${teamA.name} vs ${teamB.name}`);
  });
});

console.log(`\n📊 SUMMARY:`);
console.log(`Total Matches: ${schedule.length}`);
console.log(`Total Rounds: ${Object.keys(rounds).length}`);
console.log(`Each team plays: ${teams.length - 1} matches`);