import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { catchError } from 'rxjs/operators'; // Import catchError operator
import { of } from 'rxjs'; // Import of operator for handling errors

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit {
  map!: L.Map;
  marker!: L.Marker;
  startLat: number = 0;
  startLon: number = 0;
  latitude: string = this.startLat.toString();
  longitude: string = this.startLon.toString();
  address: string = '';
  results: string = '';
  data: any[] = [];
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map('map', {
      center: [this.startLat, this.startLon],
      zoom: 9,
    });

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'OSM',
    }).addTo(this.map);

    this.marker = L.marker([this.startLat, this.startLon], {
      title: 'Coordinates',
      draggable: true,
    })
      .addTo(this.map)
      .on('dragend', () => this.onMarkerDragEnd());
  }

  onMarkerDragEnd(): void {
    const position = this.marker.getLatLng();
    this.latitude = position.lat.toFixed(8);
    this.longitude = position.lng.toFixed(8);
    this.map.setView(
      [position.lat, position.lng],
      Math.min(this.map.getZoom() + 2, 18)
    );
    this.marker
      .bindPopup(`Lat ${this.latitude}<br>Lon ${this.longitude}`)
      .openPopup();
  }

  addrSearch(): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${this.address}`;
    this.http
      .get<any[]>(url)
      .pipe(
        catchError((error) => {
          console.error('Error:', error);
          return of([]);
        })
      )
      .subscribe((data) => {
        this.data = data;
      });
  }

  chooseAddr(lat: number, lon: number): void {
    this.marker.closePopup();
    this.map.setView([lat, lon], 18);
    this.marker.setLatLng([lat, lon]);
    this.latitude = parseFloat(lat.toString()).toFixed(8);
    this.longitude = parseFloat(lon.toString()).toFixed(8);
    this.marker
      .bindPopup(`Lat ${this.latitude}<br>Lon ${this.longitude}`)
      .openPopup();
  }
}
