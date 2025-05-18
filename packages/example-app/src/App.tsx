import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

import { ObservableClass, watchProps, observer, computed } from 'kiss-state';
import './App.css';

@ObservableClass
class User {
  name = 'gy';
  age = 26;

  constructor() {
    console.log('------------test constructor');
    this.age = 17;
  }

  @watchProps<User>('age')
  onAgeChange() {
    console.log('---------agechange', this, this.age);
  }

  @watchProps<User>('name')
  onNameChange() {
    console.log('---------namechange', this.name);
  }

  @computed<User>('age')
  get nextAge() {
    return this.age + 1;
  }

  @computed<User>('nextAge')
  get nextnextAge() {
    return this.nextAge + 1;
  }

  @computed<User>('name')
  get fullName() {
    return this.name + 'jude';
  }
}

const user = new User();

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => user.age++}>
          age is {user.age} next is {user.nextAge} fullname is {user.fullName}{' '}
          nextnextage {user.nextnextAge}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

const HocApp = observer(App, user);

export default HocApp;
