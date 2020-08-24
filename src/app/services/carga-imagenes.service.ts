import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { FileItem } from '../models/file-item';


@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {
  private _carpetaImagenes = 'img';

  constructor(private _db: AngularFirestore) { }  

  // Carga la imagen en el almacenamiento
  cargarImagenesFirebase(imagenes: FileItem[]) {
    // Se hace una referencia al api
    const storageRef = firebase.storage().ref();

    // Recorrer cada imagen
    for (const item of imagenes) {
      item.estaSubiendo = true;
      if (item.progreso >= 100) continue;

      // Ingresando las fotos a firebase
      // child() para almacenar algo en una ubicacion
      const uploadTask: firebase.storage.UploadTask = storageRef.child(`${this._carpetaImagenes}/${item.nombreArchivo}`).put(item.archivo);

      // Ejecutamos la tarea en firebase
      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        // Callback para manejar el porcentaje de la carga
        (snapshot: firebase.storage.UploadTaskSnapshot) => item.progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        (error) => console.error('Error al subir', error),
        // Calback cuando todo lo hace correcto
        async () => {
          console.log('Archivo subido correctamente');    
          item.url = await storageRef.child(uploadTask.snapshot.ref.fullPath).getDownloadURL()
          item.estaSubiendo = false;
          // console.log(item);
          this._guardarImagen({
            nombre: item.nombreArchivo,
            url: item.url
          });
        }
      );
    }
  }

  // Añade la referencia/registro a la base de datos
  private _guardarImagen(imagen: { nombre: string, url: string }) {
    this._db.collection(`/${this._carpetaImagenes}`).add(imagen);
  }

}
