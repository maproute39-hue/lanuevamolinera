import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import PocketBase from 'pocketbase';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.html',
  styleUrls: ['./add.scss'],
})
export class Add {
formData = {
    nombre: '',
    descripcion: '',
    servicios: '',
    precioCOP: 0,
    precioUSD: 0,
    capacidad: '',
    img: [] as File[],  // Para manejar múltiples imágenes
  video: null as File | null
  };
  imagePreviews: string[] = [];  // Para almacenar las URL de las imágenes cargadas
  servicesList: string[] = [];  // Lista de servicios agregados
  newService: string = '';  // Para el input de nuevo servicio
  videoPreview: string = '';  // Vista previa del video

  pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.site:8091');
  }

 // Función para agregar imágenes
  onImageChange(event: any) {
    const files = event.target.files;
    if (files) {
      // Agregar las nuevas imágenes seleccionadas al array
      Array.from(files).forEach((file: any) => {
        this.formData.img.push(file);
        const url = URL.createObjectURL(file);
        this.imagePreviews.push(url);
      });
    }
  }

  // Función para agregar video
  onVideoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.video = file;
      if (this.videoPreview) {
        URL.revokeObjectURL(this.videoPreview);
      }
      this.videoPreview = URL.createObjectURL(file);
    }
  }

  // Función para eliminar imagen
  removeImage(index: number) {
    URL.revokeObjectURL(this.imagePreviews[index]); // Liberar memoria
    this.formData.img.splice(index, 1); // Elimina la imagen del array
    this.imagePreviews.splice(index, 1); // Elimina la vista previa
  }

  // Función para eliminar video
  removeVideo() {
    if (this.videoPreview) {
      URL.revokeObjectURL(this.videoPreview);
      this.videoPreview = '';
      this.formData.video = null;
    }
  }

  // Función para agregar servicios (se añaden a una lista)
  addService() {
    if (this.newService.trim()) {
      // Verificar que no esté duplicado
      if (!this.servicesList.includes(this.newService.trim())) {
        this.servicesList.push(this.newService.trim());
        this.formData.servicios = this.servicesList.join(', ');
      }
      // Reiniciar el input
      this.newService = '';
    }
  }

  // Función para manejar el envío del formulario
  async onSubmit(event: Event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', this.formData.nombre);
    formData.append('description', this.formData.descripcion);
    formData.append('services', this.formData.servicios);  // Enviar servicios como texto
    formData.append('price_cop', this.formData.precioCOP.toString());
    formData.append('price_usd', this.formData.precioUSD.toString());
    formData.append('ability', this.formData.capacidad.toString());

    // Agregar todas las imágenes al formData
    this.formData.img.forEach(img => {
      formData.append('img', img, img.name);
    });

    // Agregar el video si existe
    if (this.formData.video) {
      formData.append('video', this.formData.video, this.formData.video.name);
    }

    try {
      const record = await this.pb.collection('habitaciones_molinera').create(formData);
      console.log('Habitación creada:', record);

      // Mostrar mensaje de éxito
      Swal.fire({
        title: 'Éxito',
        text: '¡Habitación agregada exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });

      // Resetear el formulario
      this.resetForm();
    } catch (error) {
      console.error('Error al crear habitación:', error);

      // Mostrar mensaje de error
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al agregar la habitación. Intenta de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  }

  // Función para resetear el formulario
  resetForm() {
    // Liberar URLs de vistas previas
    this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
    if (this.videoPreview) {
      URL.revokeObjectURL(this.videoPreview);
    }
    this.formData = {
      nombre: '',
      descripcion: '',
      servicios: '',
      precioCOP: 0,
      precioUSD: 0,
      capacidad: '',
      img: [],
      video: null,
    };
    this.servicesList = [];
    this.newService = '';
    this.imagePreviews = [];
    this.videoPreview = '';
  }

  // Getters y setters para formateo de precios
  get precioCOPDisplay(): string {
    return this.formData.precioCOP.toLocaleString('es-CO'); // Formato colombiano con puntos
  }

  set precioCOPDisplay(value: string) {
    const num = value.replace(/\./g, ''); // Remover puntos
    this.formData.precioCOP = parseFloat(num) || 0;
  }

  get precioUSDDisplay(): string {
    return this.formData.precioUSD.toLocaleString('en-US'); // Formato estadounidense con comas
  }

  set precioUSDDisplay(value: string) {
    const num = value.replace(/,/g, ''); // Remover comas si las hay
    this.formData.precioUSD = parseFloat(num) || 0;
  }
}
