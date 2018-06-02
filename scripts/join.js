const fs = require('fs')
const path = require('path')

const d3 = require('d3')
const json2csv = require('json2csv').parse

const dest = path.join(__dirname, '../data/generated/joined.csv')
const p = file => path.join(__dirname, '../data', file)
const elevatorsFile = fs.readFileSync(p('elevators_elevator.csv'))
const outageFile = fs.readFileSync(p('elevators_outage.csv'))

const dateFields = [
  {
    name: 'out_of_service',
    parse: d3.timeParse('%Y-%m-%d %H:%M:%S%Z'),
  }, {
    name: 'first_missed',
    parse: d3.timeParse('%Y-%m-%d %H:%M:%S.%f%Z'),
  }, {
    name: 'estimated_return',
    parse: d3.timeParse('%Y-%m-%d %H:%M:%S%Z'),
  }
]
const elevators = d3.csvParse(elevatorsFile.toString())
const outages = d3.csvParse(outageFile.toString())

const msToHours = ms => ((ms / 1000) / 60) / 60
const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S%Z')

const joined = outages.map(o => {
  const elevator = elevators.find(e => e.mta_id === o.elevator)
  if (!elevator) return

  // elevator is duplicated by `mta_id`
  // scraper isn't advanced enough to notice when `reason` changes
  delete o.elevator
  delete o.reason

  elevator.location = elevator.location.replace(/,/g, '/')
  elevator.location = elevator.location.replace(/;/g, ' ')

  dateFields.forEach(df => {
    const { name, parse } = df
    o[name] = parse(o[name])
  })

  if (o.first_missed) {
    o['outage_hours'] = msToHours(o.first_missed - o.out_of_service)
  } else {
    o['outage_hours'] = '0'
  }

  return {
    ...elevator,
    ...o
  }
})

const fields = Object.keys(joined[0])
const csv = json2csv(joined, { fields, quote: '' })

fs.writeFile(dest, csv, err => {
  if (err) throw err
  console.log(`the file (${dest}) has been saved!`)
})
