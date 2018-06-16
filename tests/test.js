import Source from '../src/source.js';
import DatalistSource from '../src/datalist-source.js';

const expect = chai.expect;
const element = document.getElementById('carousel');

mocha.setup('bdd');

describe('Source class', function() {
    context('Plain', function() {
        const source = new Source();

        it('create from plain data', function() {
            source.load([
                { label: 'Label 1', value: 1 },
                { label: 'Label 2', value: 2 },
                { label: 'Label 3', value: 3 }
            ]);

            expect(source.data.length).to.equal(3);
            expect(Object.keys(source.suggestions).length).to.equal(3);
            expect(Object.keys(source.groups).length).to.equal(0);
            expect(source.getCurrent()).to.be.undefined;
        });

        it('open/close', function() {
            expect(source.element.classList.contains('is-open')).to.be.false;
            source.update();
            expect(source.element.classList.contains('is-open')).to.be.true;
            source.open();
            expect(source.element.classList.contains('is-open')).to.be.true;
            source.close();
            expect(source.element.classList.contains('is-open')).to.be.false;
        });

        it('select suggestions', function() {
            source.selectFirst();
            expect(source.current).to.equal(0);
            expect(source.getCurrent()).to.equal(source.result[0]);
            expect(
                source.getCurrent().element.classList.contains('is-selected')
            ).to.be.true;

            expect(
                source.result[0].element.classList.contains('is-selected')
            ).to.be.true;
            expect(
                source.result[1].element.classList.contains('is-selected')
            ).to.be.false;
            expect(
                source.result[2].element.classList.contains('is-selected')
            ).to.be.false;

            source.selectNext();
            expect(source.getCurrent()).to.equal(source.result[1]);

            expect(
                source.result[0].element.classList.contains('is-selected')
            ).to.be.false;
            expect(
                source.result[1].element.classList.contains('is-selected')
            ).to.be.true;
            expect(
                source.result[2].element.classList.contains('is-selected')
            ).to.be.false;

            source.selectPrevious();
            expect(source.getCurrent()).to.equal(source.result[0]);

            expect(
                source.result[0].element.classList.contains('is-selected')
            ).to.be.true;
            expect(
                source.result[1].element.classList.contains('is-selected')
            ).to.be.false;

            source.selectByElement(source.result[2].element);
            expect(source.getCurrent()).to.equal(source.result[2]);

            expect(
                source.result[0].element.classList.contains('is-selected')
            ).to.be.false;
            expect(
                source.result[1].element.classList.contains('is-selected')
            ).to.be.false;
            expect(
                source.result[2].element.classList.contains('is-selected')
            ).to.be.true;

            //latest element
            source.selectNext();
            expect(source.getCurrent()).to.equal(source.result[2]);

            expect(
                source.result[0].element.classList.contains('is-selected')
            ).to.be.false;
            expect(
                source.result[1].element.classList.contains('is-selected')
            ).to.be.false;
            expect(
                source.result[2].element.classList.contains('is-selected')
            ).to.be.true;
        });

        it('query', function() {
            expect(source.result.length).to.equal(3);
            source.refresh('1');
            expect(source.result.length).to.equal(1);
            expect(source.getCurrent()).to.equal(source.result[0]);
        });
    });

    context('Group', function() {
        const source = new Source();

        it('create from plain data', function() {
            source.load([
                {
                    label: 'Numbers',
                    options: [
                        { label: 'Label 1', value: 1 },
                        { label: 'Label 2', value: 2 },
                        { label: 'Label 3', value: 3 }
                    ]
                },
                {
                    label: 'Letters',
                    options: [
                        { label: 'Label A', value: 'a' },
                        { label: 'Label B', value: 'b' },
                        { label: 'Label C', value: 'c' }
                    ]
                }
            ]);

            expect(source.data.length).to.equal(2);
            expect(Object.keys(source.suggestions).length).to.equal(6);
            expect(Object.keys(source.groups).length).to.equal(2);
            expect(source.getCurrent()).to.be.undefined;

            source.update();
            expect(source.getCurrent()).to.equals(source.suggestions[1]);
        });

        it('select suggestions', function() {
            source.selectNext();
            expect(source.getCurrent()).to.equals(source.suggestions[2]);
            source.selectNext();
            expect(source.getCurrent()).to.equals(source.suggestions[3]);
            source.selectNext();
            expect(source.getCurrent()).to.equals(source.suggestions['a']);
            source.selectNext();
            expect(source.getCurrent()).to.equals(source.suggestions['b']);
            source.selectNext();
            expect(source.getCurrent()).to.equals(source.suggestions['c']);
            source.selectNext();
            expect(source.getCurrent()).to.equals(source.suggestions['c']);
        });
    });
});

describe('Datalist source class', function() {
    const el = document.getElementById('search-input');
    const source = new DatalistSource(el);

    it('create from datalist element', function() {
        expect(source.data.length).to.equal(3);
        expect(Object.keys(source.suggestions).length).to.equal(3);
        expect(Object.keys(source.groups).length).to.equal(0);
        expect(source.getCurrent()).to.be.undefined;
        expect(el.list).to.be.null;
    });
});

mocha.run();
