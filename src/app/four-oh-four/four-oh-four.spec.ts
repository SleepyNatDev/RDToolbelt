import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FourOhFour } from './four-oh-four';

describe('FourOhFour', () => {
  let component: FourOhFour;
  let fixture: ComponentFixture<FourOhFour>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FourOhFour],
    }).compileComponents();

    fixture = TestBed.createComponent(FourOhFour);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
