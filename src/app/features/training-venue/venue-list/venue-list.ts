import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toSignal } from '@angular/core/rxjs-interop';

import { TrainingVenueModal } from '../training-venue-modal/training-venue-modal';
import { TrainingVenue, TrainingVenueService } from '../../../services/domain/program-venue';

@Component({
  selector: 'app-venue-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbDropdownModule],
  templateUrl: './venue-list.html',
  styleUrl: './venue-list.scss',
})
export class VenueList {
  private readonly venueService = inject(TrainingVenueService);
  private readonly modalService = inject(NgbModal);

  readonly venues = toSignal(this.venueService.allVenues$, {
    initialValue: [] as TrainingVenue[],
  });

  searchTerm = '';

  get filteredVenues(): TrainingVenue[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.venues();
    return this.venues().filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        v.city.toLowerCase().includes(term) ||
        v.country.toLowerCase().includes(term),
    );
  }

  openAddVenueModal(): void {
    this.modalService.open(TrainingVenueModal, { size: 'lg', backdrop: 'static' });
  }

  openEditVenueModal(venue: TrainingVenue): void {
    const ref = this.modalService.open(TrainingVenueModal, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.venue = venue;
  }

  async toggleActive(venue: TrainingVenue): Promise<void> {
    try {
      await this.venueService.setActive(venue.id, !venue.isActive);
    } catch (error) {
      console.error('Failed to update venue status:', error);
      alert('Failed to update the venue. Please try again.');
    }
  }

  async deleteVenue(venue: TrainingVenue): Promise<void> {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${venue.name}"?\n\nThis action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await this.venueService.delete(venue.id);
    } catch (error) {
      console.error('Failed to delete venue:', error);
      alert('Failed to delete the venue. Please try again.');
    }
  }
}
