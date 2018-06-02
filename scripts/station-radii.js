const fs = require('fs')
const path = require('path')

const d3 = require('d3')
const moment = require('moment')
const range = require('lodash.range')
const sum = require('lodash.sum')
const unique = require('lodash.uniq')

const csvPath = path.join(__dirname, '../data/generated/joined.csv')
const csvFile = fs.readFileSync(csvPath)
const csv = d3.csvParse(csvFile.toString())
const destPath = path.join(__dirname, '../data/generated/stations-with-radii.json')

const data = csv.map(row => {
  return {
    ...row,
    out_of_service: new Date(row.out_of_service),
    first_missed: new Date(row.first_missed),
    estimated_return: new Date(row.estimated_return)
  }
})

const earliestOutage = d3.min(data, d => d.out_of_service)
const groupedByStation = d3.nest().key(d => d.station).entries(data)
const latestReturn = d3.max(data, d => d.first_missed)
const stations = unique(data.map(d => d.station))

const msAsMin = ms => {
  return ((ms / 1000) / 60)
}

const radiusAtTime = (time, outages) => {
  const radii = outages.filter(outage => (
    moment(time).isBetween(outage.out_of_service, outage.first_missed)
  )).map(outage => {
    const currentOutageDuration = moment(outage.out_of_service).diff(time)
    return msAsMin(currentOutageDuration)
  })

  return Math.abs(sum(radii))
}

const minutesBetween = msAsMin(latestReturn.getTime() - earliestOutage.getTime())
const withRadii = range(minutesBetween).map(mins => {
  const t = moment(earliestOutage).add(mins, 'minutes')
  console.log('processing outage', t)
  const radii = groupedByStation.map(station => {
    const outages = station.values
    return [station.key, radiusAtTime(t, station.values)]
  })

  return {
    key: t,
    values: radii
  }
})

fs.writeFile(destPath, JSON.stringify(withRadii, null, 2), err => {
  if (err) return console.error(err)

  console.log('done', destPath)
})
