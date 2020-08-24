import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';
import { FileItem } from '../models/file-item';

// La directiva es usada para controlar y permitir arrastrar archivos al div destinado en el componente 'Carga'
// Para indicar aangular que se usa la directiva, se debe de copiar el selector en la etiqueta html:

// <div appNgDropFiles class="well drop-zone">
//   <h4>Arrastre aquí los archivos</h4>
//   <img src="assets/drop-images.png">
// </div>

// EventEmitter -> para poder comunicarte con el componente padre
// ElementRef -> sirve para tener una relacion directa con el elemento html que contiene la directiva
// HostListener -> nos permite crear eventos o callback cuando algo suceda
// Input -> para recibir informacion del padre
// Output -> para enviar informacion al padre

@Directive({
  selector: '[appNgDropFiles]'
})
export class NgDropFilesDirective {
  @Input() archivos: FileItem[] = []; // Permite al la directiva una entrada de los archivos
  @Output() mouseSobre: EventEmitter<boolean> = new EventEmitter();

  constructor() { }
  // Eventos que manejan el arrastrar y soltar archivos
  // Cuando se relaciona un evento de estos, se emite al padre, me diante el 'mouseSobre' (decorador Output), que nos permite salidas al padre del componente actual
  // Se emite falso o verdadero segun corresponda el evento, para en el html asignar una variable que controla la clase en relaciona  una visualizacion

  @HostListener('dragover', ['$event'])
  public onDragEnter(event: any) {
    this.mouseSobre.emit(true);
    this._prevenirCargarImagenEnNavegador(event);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: any) {
    this.mouseSobre.emit(false);
  }

  // Evento para obtener el archivo
  @HostListener('drop', ['$event'])
  public onDrop(event: any) {
    this.mouseSobre.emit(false);
    const trasnferencia = this._getTransferencia(event);
    if (!trasnferencia) return;
    this._extraerArchivos(trasnferencia.files);
    this._prevenirCargarImagenEnNavegador(event);
  }

  // Funcion para la transferencia del archivo
  private _getTransferencia(event: any) {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
  }

  // Para manejar los archivos, vienen del tipo FileList
  private _extraerArchivos(archivosLista: FileList) {
    // Cuando arrastramos archivos a la directiva, vienen en forma de objetos con determinado numero de elementos
    // Los recorremos para luego asignarlos al array 'archivos'

    // getOwnPropertyNames obtiene el objeto y los nombres de las propiedades
    for (const propiedad in Object.getOwnPropertyNames(archivosLista)) {
      // Obtenemos el archivo de la iteracion
      const archivoTemporal = archivosLista[propiedad];

      // Evaluamos si puede ser cargado mediante la funcion
      if (this._archivoPuedeSerCargado(archivoTemporal)) {
        const nuevoArchivo = new FileItem(archivoTemporal);
        this.archivos.push(nuevoArchivo);
      }
    }
    // console.log(this.archivos);

  }


  // Validaciones
  // Cuando arrastramos la imagen, el navegador nos carga la imagen remplazando la pagina, la siguiente funcion impide ese comportamiento
  private _prevenirCargarImagenEnNavegador(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Validacion de si el archivo ya fue arrastrado y es una imagen
  private _archivoPuedeSerCargado(archivo: File): boolean {
    if (!this._archivoExistente(archivo.name) && this._esImagen(archivo.type)) {
      return true;
    } else {
      return false;
    }
  }

  // Validacion donde se verifica que el archivo no haya sido arrastrado y este contenido en el array
  private _archivoExistente(nombreArchivo: string): boolean {
    for (const archivo of this.archivos) {
      if (archivo.nombreArchivo === nombreArchivo) {
        console.log(`El archivo ${nombreArchivo} ya está agregado`);
        return true;
      }
      return false;
    }
  }

  // Aceptar solo imagenes
  // Verificamos que no este vacio o indefinido
  // Con la funcion startsWith buscamos la palabra, un numero positivo si lo encuentra, o negativo si no lo encuentra, el return interpreta los numeros como falso (negativos), verdaderos (positivos)
  // Los objetos de archivos vienen con la palabra 'image' en el doctype
  private _esImagen(tipoArchivo: string): boolean {
    return tipoArchivo === '' || tipoArchivo === undefined ? false : tipoArchivo.startsWith('image');
  }


}
