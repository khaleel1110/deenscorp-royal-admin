import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-switcher',
  imports: [FormsModule],
  templateUrl: './project-switcher.html',
  styleUrl: './project-switcher.scss',
})
export class ProjectSwitcher implements OnInit {

  ngOnInit() {
    /* this.projectService.initialize().subscribe(() => {
       const current = this.projectService.getCurrentProjectValue();
       this.currentProjectId = current?.id ?? '';

     });

     this.projectService.getCurrentProject().subscribe((project) => {
       this.currentProjectId = project?.id ?? '';
     });*/
  }

  onProjectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedId = selectElement.value;



  }
}
