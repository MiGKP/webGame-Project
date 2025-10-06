import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGames } from './manage-games';

describe('ManageGames', () => {
  let component: ManageGames;
  let fixture: ComponentFixture<ManageGames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageGames]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGames);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
