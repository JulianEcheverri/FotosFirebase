import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { Observable } from 'rxjs';

export interface item { nombre: string, url: string }

@Component({
  selector: 'app-fotos',
  templateUrl: './fotos.component.html',
  styleUrls: ['./fotos.component.css']
})


export class FotosComponent implements OnInit {

  private _itemsConllection: AngularFirestoreCollection<item>;
  items: Observable<item[]>;

  constructor(private _afs: AngularFirestore) { 
    this._itemsConllection = _afs.collection<item>('img');
    this.items = this._itemsConllection.valueChanges();
  }

  ngOnInit(): void {
  }

}
