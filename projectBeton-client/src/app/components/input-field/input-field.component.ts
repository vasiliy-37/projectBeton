import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-input-field',
    templateUrl: './input-field.component.html',
    styleUrls: ['./input-field.component.less'],
    standalone: true,
    imports: [FormsModule]
})
export class InputFieldComponent {
    @Input() paramName: string = '';
    @Output() valueChange = new EventEmitter<number>();

    private _value: number = 0;

    get value(): number {
        return this._value;
    }

    onInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this._value = Number(input.value);

        this.valueChange.emit(this._value);
    }
}