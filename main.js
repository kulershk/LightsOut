class LightsOut {
    canvas;
    eight;
    buttons = [];
    matrix = [
        [1,1,0, 1,0,0 ,0,0,0],
        [1,1,1, 0,1,0 ,0,0,0],
        [0,1,1, 0,0,1 ,0,0,0],

        [1,0,0, 1,1,0 ,1,0,0],
        [0,1,0, 1,1,1 ,0,1,0],
        [0,0,1, 0,1,1 ,0,0,1],

        [0,0,0, 1,0,0 ,1,1,0],
        [0,0,0, 0,1,0 ,1,1,1],
        [0,0,0, 0,0,1 ,0,1,1],
    ];

    updatesDone = [];

    constructor(eight) {
        this.eight = eight;
        const c = document.getElementById("myCanvas");
        this.canvas = c.getContext("2d");
        c.addEventListener("mousedown", (event) => this.onMouseDown(event));
        c.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        for (let i = 0; i < 9; i++) {
            this.buttons[i] = new CanvasButton(i, Math.random() > 0.5, (event, button) => this.buttonClicked(event, button));
        }
        this.draw();
    }

    changeType() {
        this.eight = !this.eight;
        this.draw();
    }

    buttonClicked(id, button) {
        if (button === 2) {
            for (const [i, mId] of this.matrix[id].entries()) {
                if (mId === 1) {
                    this.buttons[i].state = !this.buttons[i].state;
                }
            }
        }
        if (button === 0) {
            this.buttons[id].state = !this.buttons[id].state;
        }

    }

    onMouseDown(event) {
        if (event.button === 0 || event.button === 2) {
            for (const button of this.buttons) {
                button.isClicked(event.offsetX, event.offsetY, event.button)
            }
        }
        this.draw();
    }

    sumRows(matrixSolution, row1, row2) {
        if (this.updatesDone[row1] === undefined) {
            this.updatesDone[row1] = [row1 ];
        }
        if (this.updatesDone[row2] === undefined) {
            this.updatesDone[row2] = [row2];
        }
        this.updatesDone[row1] = [...this.updatesDone[row2], ...this.updatesDone[row1]];
        matrixSolution[row1] = matrixSolution[row1].map(function (num, idx) {
            return (num + matrixSolution[row2][idx]) % 2 ;
        })
        //remove dupes
        let updated = [];
        for (let i = 0; i < 9; i++) {
            if(this.updatesDone[row1].filter((v) => v === i).length % 2) {
                updated.push(i);
            }
        }
        this.updatesDone[row1] = updated;

        return matrixSolution;
    }

    getSolution() {
        let matrixSolution = JSON.parse(JSON.stringify(this.matrix));
        this.updatesDone = [];
        matrixSolution = this.sumRows(matrixSolution, 1,0);
        matrixSolution = this.sumRows(matrixSolution, 0,3);

        matrixSolution = this.sumRows(matrixSolution, 2,0);
        matrixSolution = this.sumRows(matrixSolution, 4,0);

        matrixSolution = this.sumRows(matrixSolution, 1,2);
        matrixSolution = this.sumRows(matrixSolution, 5,2);

        matrixSolution = this.sumRows(matrixSolution, 1,6);
        matrixSolution = this.sumRows(matrixSolution, 3,6);
        matrixSolution = this.sumRows(matrixSolution, 4,6);

        matrixSolution = this.sumRows(matrixSolution, 0,7);
        matrixSolution = this.sumRows(matrixSolution, 2,7);
        matrixSolution = this.sumRows(matrixSolution, 3,7);

        matrixSolution = this.sumRows(matrixSolution, 1,4);
        matrixSolution = this.sumRows(matrixSolution, 2,4);
        matrixSolution = this.sumRows(matrixSolution, 8,4);

        matrixSolution = this.sumRows(matrixSolution, 3,5);
        matrixSolution = this.sumRows(matrixSolution, 6,5);
        matrixSolution = this.sumRows(matrixSolution, 7,5);

        matrixSolution = this.sumRows(matrixSolution, 0,8);
        matrixSolution = this.sumRows(matrixSolution, 2,8);
        matrixSolution = this.sumRows(matrixSolution, 6,8);

        matrixSolution = this.sumRows(matrixSolution, 7,1);
        matrixSolution = this.sumRows(matrixSolution, 8,1);

        matrixSolution = this.sumRows(matrixSolution, 5,8);

        let solution = [];
        for (const [i, row] of matrixSolution.entries()) {
            solution[row.indexOf(1)] = this.sum(this.updatesDone[i]);
        }

        if (this.eight && solution[4]) {
            this.buttons[4].state = !this.buttons[4].state;
            return this.getSolution();
        }

        return solution;
    }

    sum(ids) {
        let res = 0;
        for (const id of ids) {
            res += this.buttons[id].state
        }
        return res % 2;
    }

    draw() {
        this.canvas.clearRect(0, 0, 400, 400);
        let solution = this.getSolution();
        for (const [i, button] of this.buttons.entries()) {
            button.paint(this.canvas, solution[i], this.eight);
        }
    }
}

class CanvasButton {
    state;
    id;
    event;

    constructor(id, state, event) {
        this.id = id;
        this.state = state;
        this.event = event;
    }

    getColumn() {
        return this.id % 3
    }

    getRow() {
        return Math.floor(this.id / 3);
    }

    getLocation() {
        return {
            x: this.getColumn() * 90 + 20,
            y: this.getRow() * 90 + 20,
            w: 80,
            h: 80
        }
    }

    isClicked(x, y, button) {
        const loc = this.getLocation();
        if (x > loc.x && y > loc.y && x < loc.x+loc.w && y < loc.y+loc.h) {
            this.event.call(this.id, this.id, button);
        }
    }

    paint(canvas, solution, eight) {
        if (eight && this.id === 4) return;
        canvas.beginPath();
        canvas.lineWidth = "5";
        canvas.strokeStyle = solution?"red":"black";
        canvas.fillStyle = !this.state?'rgba(255,255,0,1)':'rgba(255,255,255, 0.2)';
        canvas.fillRect(this.getLocation().x, this.getLocation().y, this.getLocation().w, this.getLocation().h);
        canvas.rect(this.getLocation().x, this.getLocation().y, this.getLocation().w, this.getLocation().h);
        canvas.stroke();
        canvas.fillStyle = 'black';
        canvas.font = '18px serif';
        canvas.fillText(eight?(this.id > 4?this.id:this.id +1):this.id +1, this.getLocation().x + 5, this.getLocation().y + 20);
    }

}

let lightsOut = new LightsOut(true);
const btn = document.getElementById('changeType');
btn.addEventListener('click', () => {
    lightsOut.changeType();
});
