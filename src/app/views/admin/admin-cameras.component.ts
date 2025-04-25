import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-cameras',
  standalone: true,
  templateUrl: './admin-cameras.component.html',
  imports: [CommonModule, FormsModule]
})
export class AdminCamerasComponent implements OnInit {
  cameras: any[] = [];
  editingIndex: number | null = null;
  editedCamera: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCameras();
  }

  loadCameras() {
    this.http.get<any[]>('/api/cameras').subscribe(cameras => {
      this.cameras = cameras || [];
    });
  }

  editCamera(idx: number) {
    this.editingIndex = idx;
    this.editedCamera = { ...this.cameras[idx] };
  }

  saveCamera(idx: number) {
    const camera = this.editedCamera;
    this.http.put(`/api/cameras/${camera.id}`, camera).subscribe(() => {
      this.cameras[idx] = { ...camera };
      this.editingIndex = null;
    });
  }

  cancelEdit() {
    this.editingIndex = null;
  }

  deleteCamera(idx: number) {
    const camera = this.cameras[idx];
    if (confirm(`Are you sure you want to delete camera "${camera.name}"?`)) {
      this.http.delete(`/api/cameras/${camera.id}`).subscribe(() => {
        this.cameras.splice(idx, 1);
        if (this.editingIndex === idx) {
          this.editingIndex = null;
        }
      });
    }
  }
}
