import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

let styles = require('./Home.scss');

export default class Home extends React.Component {
  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <h2>Home222</h2>
            <Button type="primary">Button</Button>
          <Link to="/counter">to Counter</Link>
        </div>
      </div>
    );
  }
}
