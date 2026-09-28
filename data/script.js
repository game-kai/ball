'use strict';

// 表示関連
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext("2d");
let image = null;

// ボールの初期位置
const ballPos = [
  { name: 'jump', sx: 144, sy: 16, x: 32, y:208 , vx:0,vy:0, z:0, vz:0 },
  { name: 'standard', sx: 128, sy: 16, x: 64, y:208, vx:0,vy:0, z:0, vz:0 },
  { name: 'follow', sx: 128, sy: 32, x: 96, y:208, vx:0,vy:0, z:0, vz:0 },
  { name: 'laser', sx: 144, sy: 32, x: 32, y:240, vx:0,vy:0, z:0, vz:0 },
  { name: 'clash', sx: 128, sy: 48, x: 64, y:240, vx:0,vy:0, z:0, vz:0 },
  { name: 'bomb', sx: 144, sy: 48, x: 96, y:240, vx:0,vy:0, z:0, vz:0 },
]

// ボールが手元にあるか
const ballExist = [
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
]

// ボールの情報
const ball = [
  { name: 'white', sx: 128, sy: 0, x: 64, y:64 , vx:0,vy:0, z:0, vz:0 },
  { name: 'jump', sx: 144, sy: 16, x: 32, y:208 , vx:0,vy:0, z:0, vz:0 },
  { name: 'standard', sx: 128, sy: 16, x: 64, y:208, vx:0,vy:0, z:0, vz:0 },
  { name: 'follow', sx: 128, sy: 32, x: 96, y:208, vx:0,vy:0, z:0, vz:0 },
  { name: 'laser', sx: 144, sy: 32, x: 32, y:240, vx:0,vy:0, z:0, vz:0 },
  { name: 'clash', sx: 128, sy: 48, x: 64, y:240, vx:0,vy:0, z:0, vz:0 },
  { name: 'bomb', sx: 144, sy: 48, x: 96, y:240, vx:0,vy:0, z:0, vz:0 },
  { name: 'jump', sx: 176, sy: 16, x: 32, y:208, vx:0,vy:0, z:0, vz:0  },
  { name: 'standard', sx: 160, sy: 16, x: 64, y:208, vx:0,vy:0, z:0, vz:0 },
  { name: 'follow', sx: 160, sy: 32, x: 96, y:208, vx:0,vy:0, z:0, vz:0 },
  { name: 'laser', sx: 176, sy: 32, x: 32, y:240, vx:0,vy:0, z:0, vz:0 },
  { name: 'clash', sx: 160, sy: 48, x: 64, y:240, vx:0,vy:0, z:0, vz:0 },
  { name: 'bomb', sx: 176, sy: 48, x: 96, y:240, vx:0,vy:0, z:0, vz:0 },
]

let stage = 'title'
let wait = 0
let throwBall = -1
let grabBall = -1
let gimmicked = false

// 前回のポインター
let prevPointer = {
  x: 0,
  y: 0,
}

ctx.imageSmoothingEnabled = false;

// フレーム
let prevTimestamp = 0
const frame = (timestamp) => {
  requestAnimationFrame(frame)
  if (!prevTimestamp) prevTimestamp = timestamp
  const deltaTime = timestamp - prevTimestamp
  
  // 盤を描く
  ctx.drawImage(image, 0, 0, 128, 256, 0, 0, 128, 256)

  // タイトル画面
  if(stage === 'title') {
    ctx.drawImage(image, 128, 160, 128, 16, 0, 120, 128, 16)
    prevTimestamp = timestamp
    return
  }

  // ポインターが押され始めた
  if(pointer.down === 1 && pointer.y > 0.75 && pointer.y < 1 && wait <= 0) {
    if(pointer.x < 0.4 && pointer.y < 875) grabBall = 1
    if(pointer.x >= 0.4 && pointer.x < 0.6 && pointer.y < 0.875) grabBall = 2
    if(pointer.x >= 0.6 && pointer.y < 0.875) grabBall = 3
    if(pointer.x < 0.4 && pointer.y >= 0.875) grabBall = 4
    if(pointer.x >= 0.4 && pointer.x < 0.6 && pointer.y >= 0.875) grabBall = 5
    if(pointer.x >= 0.6 && pointer.y >= 0.875) grabBall = 6
    if(stage === 'blue') grabBall += 6
    if(!ballExist[grabBall]) grabBall = -1
  }
  // ポインターが離された
  if(!pointer.down && grabBall >= 0) {
    ball[grabBall].x = ballPos[(grabBall - 1) % 6].x
    ball[grabBall].y = ballPos[(grabBall - 1) % 6].y
    grabBall = -1
  }

  // 持って動かす
  if(pointer.down && grabBall !== -1 && wait <= 0) {
    let x, y
    x = Math.floor(pointer.x * canvas.width)
    y = Math.floor(pointer.y * canvas.height)

    if(x < 8)x = 8
    if(x > 120)x = 120
    if(y > 248) y = 248

    ball[grabBall].x = x
    ball[grabBall].y = y

    // 投げた
    if(y < 192) {
      throwBall = grabBall
      grabBall = -1
      ball[throwBall].vx = (pointer.x - prevPointer.x) * deltaTime / 4
      ball[throwBall].vy = (pointer.y - prevPointer.y) * deltaTime / 4
      gimmicked = false

      // ジャンプさせる
      if(ball[throwBall].name === 'jump')ball[throwBall].vz = 0.36
    }
  }

  // ボールが投げられた
  let moving = false
  if(throwBall >= 0) {
    for(let i = 0; i <= 12; i++) {

      // まだ陣地にあるボールは考えない
      if(ball[i].y > 186 && ball[i].vx === 0 && ball[i].vy === 0) {
        continue
      }

      // 壁に当たって反転
      if(ball[i].x < 8 && ball[i].vx < 0) {
        ball[i].vx = -ball[i].vx
        ball[i].x = 8
      }
      if(ball[i].x > 120 && ball[i].vx > 0) {
        ball[i].vx = -ball[i].vx
        ball[i].x = 120
      }
      if(ball[i].y < 8 && ball[i].vy < 0) {
        ball[i].vy = -ball[i].vy
        ball[i].y = 8
      }
      if(ball[i].y > 186 && ball[i].vy > 0) {
        ball[i].vy = -ball[i].vy
        ball[i].y = 186
      }

      // ボール同士が当たって反射
      if(ball[i].z <= 0) {
        let bx = -1
        let by = -1
        for(let j = i + 1; j <= 12; j++) {
          if(ball[j].z > 0) continue 
          const ix = ball[i].x
          const iy = ball[i].y
          const jx = ball[j].x
          const jy = ball[j].y
          const distdist = (ix - jx) * (ix - jx) + (iy - jy) * (iy - jy)
          const dist = Math.sqrt(distdist)
          // ぶつかりあった
          if(dist < 16) {
            const hx = (ix + jx) / 2
            const hy = (iy + jy) / 2
            const nx = (ix - jx) / dist
            const ny = (iy - jy) / dist

            // 位置を遠ざける
            ball[i].x = hx + nx * 8
            ball[i].y = hy + ny * 8
            ball[j].x = hx - nx * 8
            ball[j].y = hy - ny * 8

            const ivx = ball[i].vx
            const ivy = ball[i].vy
            const jvx = ball[j].vx
            const jvy = ball[j].vy
            const dotI = ivx * (-nx) + ivy * (-ny);
            const dotJ = jvx * nx + jvy * ny;
            
            ball[i].vx -= 2 * dotJ * -nx;
            ball[i].vy -= 2 * dotJ * -ny;
            ball[j].vx -= 2 * dotI * nx;
            ball[j].vy -= 2 * dotI * ny;
            ball[i].vx *= 0.2
            ball[i].vy *= 0.2
            ball[j].vx *= 0.2
            ball[j].vy *= 0.2

            // 爆発するボール
            if(
              (
                i === throwBall &&
                ball[i].name === 'bomb'
              ) ||
              (
                j === throwBall &&
                ball[j].name === 'bomb'
              )
              &&
              !gimmicked) {
              gimmicked = true
              bx = hx
              by = hy
            }
          }
        }

        // 爆発が起こった
        if(bx >= 0) {
          for(let k = 0; k <= 12; k++) {
            if(ball[k].y > 186) continue
            const kx = ball[k].x
            const ky = ball[k].y
            const dx = kx - bx
            const dy = ky - by
            const dist = Math.sqrt(dx * dx + dy * dy)
            const nx = dx / dist
            const ny = dy / dist
            ball[k].z = 0.1
            ball[k].vz = Math.max(0, (64 - dist) / 256)
            const b = Math.max(0, 48 - dist)
            ball[k].vx += nx / dist / 2
            ball[k].vy += ny / dist / 2
          }
        }
      }

      // 左右に衝撃波を出すボール
      if(
        throwBall === i &&
        ball[i].name === 'clash' &&
        Math.abs(ball[i].vx) <= 0.01 &&
        Math.abs(ball[i].vy) <= 0.01 &&
        !gimmicked
      ) {
        gimmicked = true
        for(let j = 0; j <= 12; j++) {
          if(i === j) continue
          if(ball[j].y > 186) continue
          if(
            ball[j].y - 32 < ball[i].y &&
            ball[i].y < ball[j].y + 32
          ) {
            ball[j].z = 0.1
            ball[j].vz = 0.1
            const ix = ball[i].x
            const jx = ball[j].x
            if(ix < jx) {
              ball[j].vx = (jx - ix) * 0.002
            }
            if(jx < ix) {
              ball[j].vx = (jx - ix) * 0.002
            }
          }
        }
      }

      // レーザーのボール
      if(throwBall === i && ball[i].name === 'laser') {
        for(let j = 0; j <= 12; j++) {
          if(i === j) continue
          if(
            ball[j].x - 8 < ball[i].x &&
            ball[i].x < ball[j].x + 8 &&
            ball[j].y < ball[i].y
          ) {
            ball[j].y -= 0.01 * deltaTime
            if(ball[j].y < 8) {
              ball[j].y = 8
            }
          }
        }
      }
      
      if(ball[i].z <= 0.0001) {
        ball[i].vx *= Math.pow(0.998, deltaTime)
        ball[i].vy *= Math.pow(0.998, deltaTime)
      } else {
        ball[i].vz -= 0.001 * deltaTime
      }

      // ひきつけられるボール
      if(throwBall === i && ball[i].name === 'follow') {
        ball[i].x += (ball[0].x - ball[i].x) * 0.001 * deltaTime
        ball[i].y += (ball[0].y - ball[i].y) * 0.001 * deltaTime
      }

      ball[i].x += ball[i].vx * deltaTime
      ball[i].y += ball[i].vy * deltaTime
      ball[i].z += ball[i].vz * deltaTime

      if(ball[i].z <= 0.0001) {
        ball[i].z = 0
        ball[i].vz = 0
      }
    }
    
    let moving = false
    for(let i = 0; i <= 12; i++) {
      // どれかのボールが動いているか
      if(
        Math.abs(ball[i].vx) > 0.001 ||
        Math.abs(ball[i].vy) > 0.001
      ) {
        moving = true
      }
    }

    // すべてのボールが止まったら
    if(!moving) {
      ballExist[throwBall] = false

      // 完全に止める
      for(let i = 0; i <= 12; i++) {
        ball[i].vx = 0
        ball[i].vy = 0
      }

      // 順番
      let distdist = 10000
      let nearestBall = -1
      const wx = ball[0].x
      const wy = ball[0].y
      for(let i = 1; i <= 12; i++) {
        const x = ball[i].x
        const y = ball[i].y
        if(y > 192) continue
          let tempDD = (wx - x) * (wx - x) + (wy - y) * (wy - y)
        if(tempDD < distdist) {
          distdist = tempDD
          nearestBall = i
        }
      }
      if(nearestBall > 6) {
        let exist = false
        for(let i = 1; i <= 6; i++) if(ballExist[i]) exist = true
        if(exist)
          stage = 'red'
        else {
          stage = 'blue-win'
          wait = 5000
        }
      }
      else {
        let exist = false
        for(let i = 7; i <= 12; i++) if(ballExist[i]) exist = true
        if(exist)
          stage = 'blue'
        else {
          stage = 'red-win'
          wait = 5000
        }
      }

      throwBall = -1
      wait = 1000
    }
  }

  // ボールを描く
  for(let i = 12; i >= 0; i--) {
    const b = ball[i]
    if(grabBall >= 0 && grabBall !== i && b.y > 192) continue
    if(throwBall >= 0 && b.y > 192) continue
    if(!ballExist[i] && b.y > 192) continue
    if(stage === 'red' && i > 6 && b.y > 192) continue
    if(stage === 'blue' && i <= 6 && b.y > 192) continue
    if(stage === 'red-win' && b.y > 192) continue
    if(stage === 'blue-win' && b.y > 192) continue
    ctx.drawImage(
      image,
      144, 0,
      16, 16,
      Math.floor(b.x) - 8,
      Math.floor(b.y - 8),
      16, 16
    )
    ctx.drawImage(
      image,
      b.sx, b.sy,
      16, 16,
      Math.floor(b.x) - 8,
      Math.floor(b.y - 8 - b.z),
      16, 16
    )
  }

  // ウェイト中は返す
  if(wait > 0) {
    if(stage === 'red') ctx.drawImage(image, 128, 128, 64, 16, 40, 120, 64, 16)
    if(stage === 'blue') ctx.drawImage(image, 192, 128, 64, 16, 40, 120, 64, 16)
    if(stage === 'red-win') ctx.drawImage(image, 128, 144, 64, 16, 32, 120, 64, 16)
    if(stage === 'blue-win') ctx.drawImage(image, 192, 144, 64, 16, 32, 120, 64, 16)
    wait -= deltaTime
    prevTimestamp = timestamp
    return
  }
  else {
    wait = 0
  }

  if(pointer.down > 0) pointer.down++

  prevPointer.x = pointer.x
  prevPointer.y = pointer.y
  prevTimestamp = timestamp
}

// 初期化
const start = () => {
  image = document.querySelector('img')

  requestAnimationFrame(frame)
}

const pointer = {
  x: 0,
  y: 0,
  down: 0,
}

// ポインターの位置
const pointerPosition = (x, y) => {
  const rect = canvas.getBoundingClientRect();
  let l, t, w, h

  if(rect.width * 2 < rect.height) {
    // 縦長の場合
    l = 0
    t = (rect.height - rect.width * 2) / 2
    w = rect.width
    h = rect.width * 2
  } else {
    // 横長の場合
    l = (rect.width - rect.height / 2) / 2
    t = 0
    w = rect.height / 2
    h = rect.height
  }

  pointer.x = (x - l) / w
  pointer.y = (y - t) / h
}

// ポインター関連
const pointerDown = (e) => {
  if(stage === 'title') {
    stage = 'red'
    wait = 1000
  }
  pointer.down = 1
  pointerPosition(e.clientX, e.clientY)
}
const pointerMove = (e) => {
  pointerPosition(e.clientX, e.clientY)
}
const pointerUp = (e) => {
  pointer.down = 0
  pointerPosition(e.clientX, e.clientY)
}

addEventListener('load', start)
addEventListener('pointerdown', pointerDown)
addEventListener('pointermove', pointerMove)
addEventListener('pointerup', pointerUp)