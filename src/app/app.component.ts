import { Component, OnInit } from '@angular/core';
import { TramService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  departures: any[] = [];
  loading = true;
  error = '';

  constructor(private tramService: TramService) {}

  ngOnInit() {
    this.fetchTramDepartures();
  }
  
  fetchTramDepartures() {
    //show loader in the beginning
    this.loading = true; 
  
    this.tramService.getTramDepartures().subscribe({
      next: (resp: any) => {
        if (resp?.departures?.length) {
          // get the response in this.departures
          this.departures = resp.departures

          //filter the available stations between luma and linde
            .filter((departure: any) => departure.stop_area?.name === 'Luma' 
            && departure.destination === 'Linde')
            .map((departure: any) => ({  
              destination: departure.destination,
              direction: departure.direction,
              scheduled: departure.scheduled ? new Date(departure.scheduled) : null,
              expected: departure.expected ? new Date(departure.expected) : null,
              state: departure.state,
            }));
        } else {
          //reset this.departures if there is no value ( failure case check)
          this.departures = [];  
        }
        //lodaer has to be hidden
        this.loading = false; 
      },
      error: (e: any) => {
        console.error('Error:', e);
        this.error = 'Failed to load tram departures, try again later.';
        //reset this.departures if there is no value ( failure case check) && make loader false
        this.departures = [];  
        this.loading = false;
      }
    });
  }
  
}
