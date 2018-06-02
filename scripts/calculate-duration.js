const fs = require('fs')
const path = require('path')

const d3 = require('d3')

const adjustTimezone = dateString => dateString.replace('+00:00', '-05:00')

const srcPath = path.resolve(__dirname, '../data/elevators_outage-05-21.csv')
const destPath = path.resolve(__dirname, '../data/generated/outages-with-time-deltas.csv')
const src = fs.readFileSync(srcPath)
const withDifference = d3.csvParse(src.toString(), d => {
  // elevator,reason,out_of_service,first_missed,estimated_return
  const oos = new Date(adjustTimezone(d.out_of_service))
  const fm = new Date(adjustTimezone(d.first_missed))
  const er = new Date(adjustTimezone(d.estimated_return))
  return {
    elevator: d.elevator,
    reason: d.reason,
    out_of_service: oos,
    first_missed: fm,
    estimated_return: er,
    'difference (min)': (((fm - er) / 1000) / 60),
    'duration (min)': (((fm - oos) / 1000) / 60)
  }
})

fs.writeFile(destPath, d3.csvFormat(withDifference), err => {
  if (err) return console.log('err', err)

  console.log('done')
})
