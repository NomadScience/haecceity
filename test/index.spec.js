/* global describe, it, before */

import chai from 'chai';
import { DftCube } from '../lib/haecceity.min.js';

chai.expect();
const expect = chai.expect;

describe('Given an instance of DftCube:', () => {
  let cube
  before(() => {
    cube = new DftCube();
  });
  it ('Should be able to call mount', () => {
    expect(typeof cube.mount).to.be.equal('function');
  })
  it ('Should be able to call unmount', () => {
    expect(typeof cube.unmount).to.be.equal('function');
  });
});