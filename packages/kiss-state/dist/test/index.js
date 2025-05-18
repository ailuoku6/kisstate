var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ObservableClass, watchProps } from '../decorators';
var User = /** @class */ (function () {
    function User() {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'gy'
        });
        Object.defineProperty(this, "age", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 26
        });
        console.log('------------test constructor');
        this.age = 17;
    }
    Object.defineProperty(User.prototype, "onAgeChange", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            console.log('---------agechange', this.age);
        }
    });
    __decorate([
        watchProps('age', 'name'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], User.prototype, "onAgeChange", null);
    User = __decorate([
        ObservableClass,
        __metadata("design:paramtypes", [])
    ], User);
    return User;
}());
var user = new User();
user.age = 18;
