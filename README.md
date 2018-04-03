# mta station elevator outage visualizations

some explorations of nyc mta elevator outage data

## data

* `elevators_*.csv` are from [mta nyc elevator and escalator status page](http://advisory.mtanyct.info/EEoutage/EEOutageReport.aspx?StationID=All)

  `elevators.elevator.csv` headings:
    * `station` - The station name (`(ID: )` refers to an internal ID, not from the MTA)
    * `mta_id` - The MTA id of the elevator
    * `location` - A description of the elevator

  `elevators_outage.csv` headings:
    * `elevator` - The MTA id of the elevator
    * `reason` - The stated reason for the outage when it is first posted
    * `out_of_service` - The time given by the MTA for when the outage started
    * `first_missed` - Time of the scraper run (runs every minute) that first noticed the outage was gone
    * `estimated_return` - The time when the MTA originally estimated the elevator to return to service

* `joined.csv` is created by `scripts/join.js`
