import math, json, sys

import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_JS = os.path.join(HERE, '..', 'www', 'js', 'icons.js')
SHEET = os.path.join(HERE, 'icons-sheet.html')

# ---------- اندازهٔ بدن ----------
TORSO, THIGH, SHIN, UA, FA_, HR = 15, 12, 12, 8.5, 8.5, 3.3
GY = 54

def add(a, b): return (a[0] + b[0], a[1] + b[1])
def sub(a, b): return (a[0] - b[0], a[1] - b[1])
def mul(a, k): return (a[0] * k, a[1] * k)
def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])
def unit(a):
    d = math.hypot(*a) or 1e-6
    return (a[0] / d, a[1] / d)
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def pol(c, r, deg):  # زاویه از محور x، جهت ساعت‌گرد روی صفحه
    a = math.radians(deg); return (c[0] + r * math.cos(a), c[1] + r * math.sin(a))

def ik(A, B, l1, l2, bend):
    dx, dy = B[0] - A[0], B[1] - A[1]
    d = math.hypot(dx, dy) or 1e-6
    ux, uy = dx / d, dy / d
    dd = min(d, l1 + l2 - 0.01)
    a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd)
    h = math.sqrt(max(l1 * l1 - a * a, 0))
    mid = (A[0] + ux * a, A[1] + uy * a)
    E = (mid[0] - uy * h * bend, mid[1] + ux * h * bend)
    return [A, E, (A[0] + ux * dd, A[1] + uy * dd)]

# ---------- پریمیتیوها ----------
def poly(pts, op=1, w=None, dash=None): return dict(t='poly', pts=list(pts), op=op, w=w, dash=dash)
def circ(c, r, op=1, fill=False, w=None): return dict(t='circ', c=c, r=r, op=op, fill=fill, w=w)
def ground(y=GY): return dict(t='ground', y=y)

# ---------- فیگر ----------
def A(t, bend=1, far=False, side=0): return ('ik', t, bend, far, side)
def Ap(pts, far=False, side=0): return ('pts', pts, far, side)
def Lg(t, bend=-1, far=False, side=0): return ('ik', t, bend, far, side)
def Lp(pts, far=False, side=0): return ('pts', pts, far, side)

def fig(S=None, P=None, ta=None, arms=(), legs=(), head=None, eq=(), mk=(), nohead=False, sw=0, hw=0):
    if S is None: S = add(P, (TORSO * math.sin(math.radians(ta)), -TORSO * math.cos(math.radians(ta))))
    prims = list(eq)
    body = [poly([S, P], 1)]
    if sw: body.append(poly([(S[0] - sw, S[1]), (S[0] + sw, S[1])], 1))
    if hw: body.append(poly([(P[0] - hw, P[1]), (P[0] + hw, P[1])], 1))
    if not nohead:
        hc = head if head else add(S, mul(unit(sub(S, P)), HR + 2.7))
        body.append(circ(hc, HR, 1))
    for lst, root, l1, l2, wd in ((arms, S, UA, FA_, sw), (legs, P, THIGH, SHIN, hw)):
        for item in lst:
            side = item[-1]
            r = (root[0] + side * wd, root[1])
            if item[0] == 'ik':
                _, t, bend, far, _s = item
                pts = ik(r, t, l1, l2, bend)
            else:
                _, pts, far, _s = item
                pts = list(pts)
            body.append(poly(pts, 0.5 if far else 1))
    return prims + body + list(mk)

# ---------- تجهیزات ----------
def bar(x1, x2, y, w=2.4): return [poly([(x1, y), (x2, y)], .55, w)]
def barc(c): return [circ(c, 1.8, .6, True)]
def post(x, y1, y2): return poly([(x, y1), (x, y2)], .55, 2)
def bench(x1, x2, top, g=GY):
    return [poly([(x1, top), (x2, top)], .55, 2.4), post(x1 + 1.5, top, g), post(x2 - 1.5, top, g)]
def box(x1, x2, top, g=GY): return [poly([(x1, g), (x1, top), (x2, top), (x2, g)], .55, 2)]
def wall(x, y1=2, y2=GY):
    r = [poly([(x, y1), (x, y2)], .55, 2.2)]
    for y in range(int(y1) + 4, int(y2), 7): r.append(poly([(x, y), (x + 4, y - 3)], .35, 1.6))
    return r
def pbars(x1, x2, y, g=GY): return [poly([(x1, y), (x2, y)], .55, 2.4), post(x2 - 2, y, g)]
def rings(x, y, n=1):
    r = []
    for dx in ([0] if n == 1 else [-5, 5]):
        r += [poly([(x + dx, 0), (x + dx, y - 3)], .55, 1.6), circ((x + dx, y), 3, .6)]
    return r

# ---------- نشانگرها ----------
def arrow(a, b, op=.9, head=3.2, w=1.8):
    u = unit(sub(b, a)); n = (-u[1], u[0])
    h1 = add(sub(b, mul(u, head)), mul(n, head * .7)); h2 = sub(sub(b, mul(u, head)), mul(n, head * .7))
    return [poly([a, b], op, w), poly([h1, b, h2], op, w)]
def darrow(a, b, op=.9):
    return arrow(a, b, op) + arrow(b, a, op)[1:]
def arc(c, r, a1, a2, op=.9, head=True, w=1.8, both=False):
    n = 14; pts = [pol(c, r, a1 + (a2 - a1) * i / n) for i in range(n + 1)]
    out = [poly(pts, op, w, dash='2 2.4')]
    if head:
        out += arrow(pts[-3], pts[-1], op)[1:]
        if both: out += arrow(pts[2], pts[0], op)[1:]
    return out
def diamond(c, s=2.6): return [poly([(c[0], c[1] - s), (c[0] + s, c[1]), (c[0], c[1] + s), (c[0] - s, c[1]), (c[0], c[1] - s)], .9, 1.7)]
def motion(x, y, n=3, gap=3.2, ln=3): return [poly([(x + i * gap - gap, y), (x + i * gap - gap, y + ln)], .7, 1.6) for i in range(n)]
def pause(c): return [poly([(c[0] - 1.6, c[1] - 3), (c[0] - 1.6, c[1] + 3)], .9, 2), poly([(c[0] + 1.6, c[1] - 3), (c[0] + 1.6, c[1] + 3)], .9, 2)]

def lineP(S, gy=GY, L=39, fx_sign=-1, g=None):
    dy = gy - S[1]
    fx = S[0] + fx_sign * math.sqrt(max(L * L - dy * dy, 0))
    F = (fx, gy)
    return lerp(S, F, 15 / 39), F

G = ground()
POSES = {}

def pushup(sy, hx=46, extra_arms=None, mk=(), eq=(), arm_bend=1):
    S = (hx, sy); P, F = lineP(S)
    return fig(S, P, arms=extra_arms or [A((hx, GY), arm_bend)], legs=[Lg(F)], eq=[G, *eq], mk=mk)

# ======================= هُل دادن (۱–۲۰) =======================
POSES[1] = pushup(46)
def kneepush(sy=47, hx=46):
    S = (hx, sy); K = (S[0] - math.sqrt(27 ** 2 - (GY - sy) ** 2), GY); P = lerp(S, K, 15 / 27)
    return fig(S, P, arms=[A((hx, GY), 1)], legs=[Lp([P, K, (K[0] - 9, K[1] - 6)])], eq=[G])
POSES[2] = kneepush()
S3 = (42, 46); K3 = (27, GY)
POSES[3] = fig(S3, (27, 42), arms=[A((42, GY), 1)], legs=[Lp([(27, 42), K3, (17, 49)])], eq=[G])
POSES[4] = pushup(46, mk=diamond((46, 58.5)))
POSES[5] = pushup(46, mk=darrow((30, 58.5), (60, 58.5)))
POSES[6] = pushup(46, mk=arrow((38, 58.5), (44, 58.5)) + arrow((54, 58.5), (48, 58.5)))
def incline():
    hand = (48, 40); S = (48, 29); P, F = lineP(S)
    return fig(S, P, arms=[A(hand, 1)], legs=[Lg(F)], eq=[G, *box(42, 62, 40)])
POSES[7] = incline()
def decline():
    F = (14, 42); sy = 47; S = (F[0] + math.sqrt(39 ** 2 - (sy - 42) ** 2), sy); P = lerp(S, F, 15 / 39)
    return fig(S, P, arms=[A((S[0], GY), 1)], legs=[Lg(F)], eq=[G, *box(2, 22, 42)])
POSES[8] = decline()
POSES[9] = fig((40, 38), (27, 30), arms=[A((42, GY), 1)], legs=[Lg((17, GY))], head=(47, 45), eq=[G])
def pseudo():
    S = (42, 39); P, F = lineP(S)
    return fig(S, P, arms=[A((29, GY), 1)], legs=[Lg(F)], eq=[G])
POSES[10] = pseudo()
def clap():
    S = (46, 33); P, F = lineP(S, gy=GY - 4)
    return fig(S, P, arms=[A((46, 50), 1)], legs=[Lg((F[0], F[1]))], eq=[G], mk=motion(40, 55.5, 3, 3.5, 2.6))
POSES[11] = clap()
def archer():
    S = (42, 46); P, F = lineP(S)
    return fig(S, P, arms=[A((40, GY), 1), A((60, GY), 1, far=True)], legs=[Lg(F)], eq=[G])
POSES[12] = archer()
def onearm():
    S = (46, 38); P, F = lineP(S)
    return fig(S, P, arms=[A((46, GY), 1), Ap([S, (S[0] - 6, S[1] - 1.5), (P[0] + 2, P[1] - 1)], far=True)], legs=[Lg(F), Lg((F[0] + 8, GY), far=True)], eq=[G])
POSES[13] = onearm()
POSES[14] = fig((36, 19), (36, 34), arms=[A((38, 36), 1)], legs=[Lp([(36, 34), (36, 46), (26, 50)])], eq=pbars(26, 48, 36))
POSES[15] = fig((24, 24), (27, 39), arms=[A((19, 41), 1)], legs=[Lg((52, GY))], eq=[G, *bench(4, 22, 41)])
POSES[16] = fig((25, 17), (30, 31), arms=[A((19, 35), 1)], legs=[Lp([(30, 31), (38, 40), (36, 52)])], eq=[poly([(12, 35), (24, 35)], .55, 2.4), post(14, 35, GY), G])
def hspu_wall():
    S = (44, 47); P = (46, 32); F = add(P, mul(unit(sub(P, S)), 24))
    return fig(S, P, arms=[A((40, GY), 1)], legs=[Lp([P, F])], eq=[G, *wall(F[0] + 4, 2)])
POSES[17] = hspu_wall()
def hs_free(sy=37, bent=False):
    S = (32, sy); P = (32, sy - 15); F = (32, P[1] - 24)
    return fig(S, P, arms=[A((32, GY), 1), A((32, GY), -1, far=True)] if False else [A((32, GY), 1)], legs=[Lp([P, F]), Lp([P, (F[0] + 5, F[1] + 1)], far=True)], head=(32, S[1] + 5.9), eq=[G])
POSES[18] = hs_free()
def dive():
    S = (34, 40); P = (24, 50)
    return fig(S, P, arms=[A((37, GY), 1)], legs=[Lp([P, (2, 54)])], eq=[G], mk=arc((26, 60), 24, -160, -20, .7, True))
POSES[19] = dive()
def revpush():
    S = (20, 40); P = (34, 42)
    return fig(S, P, arms=[A((20, GY), -1)], legs=[Lg((46, GY), bend=-1)], head=(14, 37), eq=[G])
POSES[20] = revpush()

# ======================= کشیدن (۲۱–۴۰) =======================
BARY = 5
def pull_top(bx=36, grip=None, s_y=12, body_ang=0, legs_style='back', mk=(), eq_extra=(), hand_far=None):
    S = (30, s_y); P = (30 - 1.5, s_y + 15)
    legs = {'back': [Lp([P, (P[0] + 2, P[1] + 12), (P[0] - 6, P[1] + 22)])],
            'straight': [Lp([P, (P[0], P[1] + 24)])]}[legs_style]
    arms = [A((bx, BARY), -1)]
    return fig(S, P, arms=arms, legs=legs, head=(S[0] + 3.5, S[1] - 5.2), eq=[*bar(14, 56, BARY), *eq_extra], mk=mk)
POSES[21] = pull_top()
POSES[22] = pull_top(mk=darrow((18, 0.5 - 0), (54, 0.5 - 0)))
POSES[23] = pull_top(mk=arrow((30, 0), (34, 0)) + arrow((42, 0), (38, 0)))
POSES[24] = pull_top(eq_extra=[poly([(36, BARY), (36, BARY + 6)], .8, 2.2)])
POSES[25] = pull_top(mk=arc((36, 12), 5, -30, 150, .9, True))
def commando():
    S = (30, 14); P = (29, 29)
    return fig(S, P, arms=[A((34, BARY), -1), A((36, BARY), -1, far=True)], legs=[Lp([P, (30, 41), (23, 51)])], head=(41, 9), eq=[*barc((36, BARY)), poly([(36, BARY), (36, BARY)], .5)])
POSES[26] = commando()
def lsit_pull():
    S = (30, 12); P = (28.5, 27)
    return fig(S, P, arms=[A((36, BARY), -1)], legs=[Lp([P, (P[0] + 24, P[1] - 1)])], head=(33.5, 6.8), eq=bar(14, 56, BARY))
POSES[27] = lsit_pull()
def archer_pull():
    S = (42, 18); P = (42, 33)
    return fig(S, P, arms=[A((50, BARY), 1), A((24, BARY), 1, far=True)], legs=[Lp([P, (40, 56)])], head=(42, 12), eq=bar(6, 58, BARY))
POSES[28] = archer_pull()
def onearm_pull():
    S = (32, 17); P = (32, 32)
    return fig(S, P, arms=[A((32, BARY), 1), Ap([S, (27, 24), (28, 31)], far=True)], legs=[Lp([P, (32, 56)])], head=(32, 11), eq=bar(14, 50, BARY))
POSES[29] = onearm_pull()
POSES[30] = pull_top(mk=arc((30, 20), 20, 200, 20, .8, True, w=1.6)[:1] + arc((30, 20), 20, 200, 340, .8, True, w=1.6))
def chest_bar():
    S = (30, 14); P = (29, 29)
    return fig(S, P, arms=[A((36, 14), -1)], legs=[Lp([P, (30, 41), (23, 51)])], head=(32.5, 8), eq=bar(14, 56, 14), mk=motion(20, 53, 3, 3.5, 3))
POSES[31] = chest_bar()
def mu_trans():
    S = (31, 10); P = (24, 22)
    return fig(S, P, arms=[Ap([S, (30, 17), (36, 14)])], legs=[Lp([P, (23, 34), (18, 45)])], head=(36, 5), eq=bar(14, 56, 14))
POSES[32] = mu_trans()
def mu_bar():
    S = (32, 16); P = (28, 31)
    return fig(S, P, arms=[A((32, 33), 1)], legs=[Lp([P, (27, 43), (19, 52)])], head=(35, 9.5), eq=[*bar(16, 52, 33)], mk=arrow((50, 26), (50, 14), .8))
POSES[33] = mu_bar()
def mu_ring():
    S = (32, 16); P = (28, 31)
    return fig(S, P, arms=[A((32, 33), 1)], legs=[Lp([P, (27, 43), (19, 52)])], head=(35, 9.5), eq=rings(32, 35, 1))
POSES[34] = mu_ring()
def aus_row(hang_y=34, pulled=False):
    S = (34, 38 if not pulled else 33); P, F = lineP(S, fx_sign=-1)
    return fig(S, P, arms=[A((34, hang_y - 3), -1)], legs=[Lg(F)], eq=[G, *bar(20, 44, hang_y - 4), post(44, hang_y - 4, GY)])
POSES[35] = aus_row(pulled=True)
def towel_row():
    S = (26, 28); P = lerp(S, (53.4, 54), 15 / 39)
    F = (S[0] + math.sqrt(39 ** 2 - (54 - 28) ** 2), 54)
    P = lerp(S, F, 15 / 39)
    return fig(S, P, arms=[A((42, 32), 1)], legs=[Lg(F)], eq=[G, poly([(F[0] + 7, 10), (F[0] + 7, GY)], .55, 2.2), poly([(42, 32), (F[0] + 7, 32)], .8, 1.6, '2 2')])
POSES[36] = towel_row()
def single_row():
    S = (34, 36); P, F = lineP(S)
    return fig(S, P, arms=[A((34, 30), -1), Ap([S, (S[0] - 5, S[1] - 6), (S[0] - 10, S[1] - 5)], far=True)], legs=[Lg(F)], eq=[G, *bar(20, 44, 30), post(44, 30, GY)])
POSES[37] = single_row()
def pullover():
    S = (26, 24); P = (41, 25)
    return fig(S, P, arms=[A((22, 12), 1)], legs=[Lp([P, (64, 25)])], head=(20, 27), eq=bar(10, 40, 12), mk=arc((46, 10), 16, 10, -150, .8, True)[:0] + arc((44, 18), 20, 0, -160, .8, True))
POSES[38] = pullover()
def scap():
    S = (32, 25); P = (32, 40)
    return fig(S, P, arms=[A((32, 8), 1)], legs=[Lp([P, (32, 63)])], head=(32, 19), eq=bar(16, 48, 8), mk=arrow((46, 30), (46, 22), .9))
POSES[39] = scap()
def bentknee_row():
    S = (22, 40); P = (36, 40)
    return fig(S, P, arms=[A((22, 30), -1)], legs=[Lp([P, (47, 45), (47, 56)])], head=(16, 40), eq=[G, *bar(10, 34, 30)])
POSES[40] = bentknee_row()

# ======================= پایین‌تنه (۴۱–۶۰) =======================
def squat(P=(24, 41), ta=40, hand=True, foot=(31, GY), mk=(), eq=()):
    S = add(P, (TORSO * math.sin(math.radians(ta)), -TORSO * math.cos(math.radians(ta))))
    return fig(S, P, arms=[A((S[0] + 16, S[1] - 1), 1)] if hand else [], legs=[Lg(foot)], eq=[G, *eq], mk=mk)
POSES[41] = squat()
POSES[42] = squat(P=(25, 47), ta=30, foot=(31, GY))
def sumo():
    S = (32, 19); P = (32, 34)
    return fig(S, P, arms=[Ap([S, (27, 25), (32, 24)]), Ap([S, (37, 25), (32, 24)])], legs=[Lp([P, (21, 43), (17, GY)]), Lp([P, (43, 43), (47, GY)])], head=(32, 13), eq=[G])
POSES[43] = sumo()
def jumpsq():
    S = (32, 20); P = (32, 35)
    return fig(S, P, arms=[Ap([S, (27, 12), (25, 4)]), Ap([S, (37, 12), (39, 4)])], legs=[Lp([P, (32, 47)])], head=(32, 14), eq=[], mk=[poly([(18, 58), (46, 58)], .45, 2)] + motion(26, 52, 3, 5, 3)) if False else fig(S, P, arms=[Ap([S, (27, 12), (25, 4)]), Ap([S, (37, 12), (39, 4)])], legs=[Lp([P, (30, 47), (29, 57)]), Lp([P, (35, 46), (36, 55)])], head=(32, 14), eq=[G.__class__(**G)], mk=[])
POSES[44] = jumpsq()
def pistol():
    P = (24, 42); S = add(P, (TORSO * math.sin(math.radians(35)), -TORSO * math.cos(math.radians(35))))
    return fig(S, P, arms=[A((S[0] + 16, S[1] - 1), 1)], legs=[Lg((28, GY)), Lp([P, (P[0] + 24, P[1] - 2)], far=False)], eq=[G])
POSES[45] = pistol()
def bulg():
    P = (26, 38); S = (28, 23)
    return fig(S, P, arms=[A((S[0] + 14, S[1] + 4), 1)], legs=[Lg((40, GY)), Lp([P, (19, 38), (11, 33)], far=True)], eq=[G, *bench(2, 14, 36)])
POSES[46] = bulg()
def skater():
    P = (30, 40); S = add(P, (TORSO * math.sin(math.radians(40)), -TORSO * math.cos(math.radians(40))))
    return fig(S, P, arms=[A((S[0] + 14, S[1] + 5), 1)], legs=[Lg((34, GY)), Lp([P, (25, 50), (13, 46)], far=True)], eq=[G])
POSES[47] = skater()
def sissy():
    foot = (37, GY); K = (43, 40); P = (33, 31); S = add(P, mul(unit(sub(P, K)), 15))
    return fig(S, P, arms=[A((S[0] + 14, S[1] + 4), 1)], legs=[Lp([P, K, foot, (41, GY)])], eq=[G])
POSES[48] = sissy()
def lunge(dirmark=None, lift=0):
    P = (28, 43 - lift); S = (28, 28 - lift)
    mk = []
    if dirmark == 'f': mk = arrow((36, 59), (52, 59))
    if dirmark == 'b': mk = arrow((20, 59), (4, 59))
    return fig(S, P, arms=[A((S[0] + 4, S[1] + 14), 1)], legs=[Lg((42, GY - lift)), Lp([P, (19, 52 - lift), (8, 49 - lift)])], eq=[G], mk=mk)
POSES[49] = lunge('f'); POSES[50] = lunge('b')
def sidelunge():
    S = (30, 19); P = (30, 34)
    return fig(S, P, arms=[Ap([S, (25, 25), (30, 24)]), Ap([S, (35, 25), (30, 24)])], legs=[Lp([P, (17, 43), (13, GY)]), Lp([P, (45, 40), (53, GY)])], head=(30, 13), eq=[G])
POSES[51] = sidelunge()
def jumplunge():
    P = (28, 38); S = (28, 23)
    return fig(S, P, arms=[Ap([S, (22, 28), (28, 31)]), Ap([S, (34, 28), (28, 31)])], legs=[Lp([P, (36, 46), (36, 56)]), Lp([P, (22, 48), (10, 47)])], eq=[G], mk=[])
def jumplunge2():
    P = (28, 36); S = (28, 21)
    return fig(S, P, arms=[A((S[0] + 4, S[1] + 14), 1)], legs=[Lg((42, 50)), Lp([P, (19, 46), (8, 43)])], eq=[G], mk=motion(22, 55.5, 4, 5, 2.4))
POSES[52] = jumplunge2()
def bridge(single=False):
    S = (14, 50); P = (28, 44)
    legs = [Lg((42, GY))]
    if single: legs = [Lg((42, GY)), Lp([P, (P[0] + 22, P[1] - 15)], far=False)]
    return fig(S, P, arms=[Ap([S, (24, 53)])], legs=legs, head=(8.5, 52), eq=[G])
POSES[53] = bridge(False)
def bridge1():
    S = (14, 50); P = (28, 44)
    return fig(S, P, arms=[Ap([S, (24, 53)])], legs=[Lg((42, GY)), Lp([P, (P[0] + 23, P[1] - 12)])], head=(8.5, 52), eq=[G])
POSES[54] = bridge1()
def goodmorning():
    P = (30, 33); S = (44.5, 29.5)
    return fig(S, P, arms=[A((46, 21), -1)], legs=[Lg((28, GY), -1)], head=(50.5, 28.5), eq=[G])
POSES[55] = goodmorning()
def calf(single=False):
    S = (32, 15); P = (32, 30)
    legs = [Lp([P, (32, 49), (37, 54)])] if not single else [Lp([P, (32, 49), (37, 54)]), Lp([P, (35, 42), (26, 44)], far=True)]
    return fig(S, P, arms=[Ap([S, (28, 23), (28, 30)])], legs=legs, head=(32, 9), eq=[G], mk=arrow((22, 40), (22, 30), .9) if not single else arrow((20, 44), (20, 34), .9))
POSES[56] = calf(False); POSES[57] = calf(True)
def seatcalf():
    S = (24, 20); P = (24, 36)
    return fig(S, P, arms=[Ap([S, (29, 28), (34, 33)])], legs=[Lp([P, (36, 36), (36, 48), (41, 54)])], head=(24, 14), eq=[G, poly([(16, 38), (30, 38)], .55, 2.4), poly([(16, 38), (16, 22)], .55, 2.2), post(18, 38, GY), post(29, 38, GY)])
POSES[58] = seatcalf()
POSES[59] = squat(P=(24, 41), ta=40, mk=darrow((52, 38), (52, 52), .9) if False else arrow((14, 46), (14, 37), .9) + arrow((14, 37), (14, 46), .0)[:0])
def wallsit():
    S = (18, 24); P = (18, 39)
    return fig(S, P, arms=[A((34, 27), 1)], legs=[Lp([P, (31, 40), (31, GY)])], head=(18, 18), eq=[G, *wall(12, 6, GY)])
POSES[60] = wallsit()

# ======================= کور (۶۱–۸۰) =======================
def crunch():
    P = (28, 51); S = (17, 41)
    return fig(S, P, arms=[A((11, 38), -1)], legs=[Lp([P, (37, 42), (42, 53)])], head=(13, 36.5), eq=[G])
POSES[61] = crunch()
def revcrunch():
    S = (8, 52); P = (23, 52)
    return fig(S, P, arms=[Ap([S, (18, 53)])], legs=[Lp([P, (31, 41), (22, 33)])], head=(2.5, 52), eq=[G], mk=arrow((40, 50), (40, 40), .8))
POSES[62] = revcrunch()
def bicycle():
    P = (30, 51); S = (19, 41)
    return fig(S, P, arms=[A((26, 36), -1)], legs=[Lp([P, (40, 43), (44, 53)]), Lp([P, (P[0] + 23, P[1] - 5)], far=True)], head=(14, 36), eq=[G])
POSES[63] = bicycle()
def eplank(mk=(), arrow_=None):
    S = (40, 44); P, F = lineP(S)
    return fig(S, P, arms=[Ap([S, (40, 52), (50, 52)])], legs=[Lg(F)], eq=[G], mk=mk)
POSES[64] = eplank()
POSES[65] = pushup(37)
def sideplank():
    S = (24, 44); P, F = lineP(S, fx_sign=1)
    return fig(S, P, arms=[Ap([S, (24, 53), (12, 53)]), Ap([S, (24, 27)], far=False)], legs=[Lg(F)], head=(19, 39), eq=[G])
POSES[66] = sideplank()
S67 = (40, 44); P67, F67 = lineP(S67)
POSES[67] = eplank(mk=darrow((20, 30), (50, 30)))
POSES[68] = eplank(mk=arrow((26, 46), (26, 56), .9))
def mountain(extra=()):
    S = (44, 37); P, F = lineP(S)
    return fig(S, P, arms=[A((44, GY), 1)], legs=[Lg(F, far=True), Lp([P, (40, 47), (35, GY)])], eq=[G], mk=extra)
POSES[69] = mountain()
POSES[70] = mountain(arrow((46, 28), (40, 40), .9) + [])
def hang_knee():
    S = (30, 22); P = (30, 37)
    return fig(S, P, arms=[A((32, 6), 1)], legs=[Lp([P, (42, 40), (38, 50)])], head=(30, 16), eq=bar(16, 48, 6))
POSES[71] = hang_knee()
def hang_leg():
    S = (28, 22); P = (28, 37)
    return fig(S, P, arms=[A((30, 6), 1)], legs=[Lp([P, (P[0] + 24, P[1] - 1)])], head=(28, 16), eq=bar(14, 46, 6))
POSES[72] = hang_leg()
def wipers():
    S = (32, 22); P = (32, 37)
    return fig(S, P, arms=[Ap([S, (27, 14), (24, 6)]), Ap([S, (37, 14), (40, 6)])], legs=[Lp([P, (54, 28)])], head=(32, 16), eq=bar(14, 50, 6), mk=arc(P, 24, -60, -140, .9, True, both=True)[:0] + arc(P, 24, -10, 60, .9, True, both=True))
POSES[73] = wipers()
def floorL():
    S = (26, 39); P = (26, 54)
    return fig(S, P, arms=[A((26, 56), 1)], legs=[Lp([P, (50, 54)])], head=(26, 33), eq=[ground(56)])
POSES[74] = floorL()
def barL():
    S = (28, 22); P = (28, 37)
    return fig(S, P, arms=[A((30, 40), 1)], legs=[Lp([P, (52, 37)])], head=(28, 16), eq=[G, *pbars(18, 44, 40)])
POSES[75] = barL()
def vup():
    P = (32, 48); S = (23, 36)
    return fig(S, P, arms=[A((44, 29), -1)], legs=[Lp([P, (46, 28)])], head=(19, 31), eq=[G])
POSES[76] = vup()
def hollow():
    P = (30, 52); S = (16.5, 46)
    return fig(S, P, arms=[Ap([S, (3, 44)])], legs=[Lp([P, (53, 43)])], head=(11, 48.5), eq=[G])
POSES[77] = hollow()
def superman():
    P = (30, 52); S = (44, 49)
    return fig(S, P, arms=[Ap([S, (60, 45)])], legs=[Lp([P, (7, 47)])], head=(50, 47), eq=[G])
POSES[78] = superman()
def russian():
    P = (30, 50); S = (20, 39)
    return fig(S, P, arms=[Ap([S, (30, 42), (38, 42)])], legs=[Lp([P, (41, 43), (53, 40)])], head=(15, 34), eq=[G], mk=arc((30, 44), 14, 200, 330, .9, True, both=True)[:0])
POSES[79] = russian()
def paloff():
    S = (32, 18); P = (32, 33)
    return fig(S, P, arms=[Ap([S, (28, 25), (32, 24)]), Ap([S, (36, 25), (32, 24)])], legs=[Lp([P, (27, 44), (25, GY)]), Lp([P, (37, 44), (39, GY)])], head=(32, 12), eq=[G, post(2, 6, GY)], mk=[poly([(2, 24), (31, 24)], .8, 1.6, '2 2')])
POSES[80] = paloff()

# ======================= مهارت‌ها (۸۱–۱۰۰) =======================
POSES[81] = hs_free()
def crow():
    S = (38, 38); P = (24, 33)
    return fig(S, P, arms=[A((34, GY), 1)], legs=[Lp([P, (34, 41), (26, 42)])], head=(44, 40.5), eq=[G])
POSES[82] = crow()
def frog():
    S = (38, 42); P = (24, 40)
    return fig(S, P, arms=[A((34, GY), 1)], legs=[Lp([P, (35, 44), (25, 47)])], head=(44, 44), eq=[G])
POSES[83] = frog()
def tuckplanche():
    S = (38, 37); P = (26, 33)
    return fig(S, P, arms=[A((36, GY), 1)], legs=[Lp([P, (34, 40), (25, 42)])], head=(44, 39), eq=[G])
POSES[84] = tuckplanche()
def advplanche():
    S = (40, 37); P = (25, 36)
    return fig(S, P, arms=[A((38, GY), 1)], legs=[Lp([P, (14, 38), (3, 40)])], head=(46, 37), eq=[G])
POSES[85] = advplanche()
def floorlever():
    S = (18, 38); P = (33, 38)
    return fig(S, P, arms=[Ap([S, (10, 34), (2, 31)])], legs=[Lp([P, (57, 38)])], head=(12, 40), eq=[G, poly([(2, 31), (2, GY)], .55, 2.2)])
POSES[86] = floorlever()
def tuckFL():
    S = (22, 26); P = (37, 26)
    return fig(S, P, arms=[A((20, 6), 1)], legs=[Lp([P, (29, 33), (39, 36)])], head=(16, 28), eq=bar(10, 32, 6))
POSES[87] = tuckFL()
def fullFL():
    S = (14, 26); P = (29, 26)
    return fig(S, P, arms=[A((13, 8), 1)], legs=[Lp([P, (53, 26)])], head=(8, 27), eq=bar(4, 24, 8))
POSES[88] = fullFL()
def tuckBL():
    S = (24, 28); P = (39, 28)
    return fig(S, P, arms=[A((30, 8), 1)], legs=[Lp([P, (33, 36), (42, 40)])], head=(18, 30), eq=bar(14, 40, 8))
POSES[89] = tuckBL()
def dragon():
    S = (14, 44); u = unit((0.34, -0.94)); P = add(S, mul(u, 15)); F = add(S, mul(u, 39))
    return fig(S, P, arms=[Ap([S, (8, 42), (6, 36)])], legs=[Lp([P, F])], head=(10.5, 49.5), eq=[G, *bench(2, 24, 47)])
POSES[90] = dragon()
def human_flag():
    S = (18, 30); P = (33, 30)
    return fig(S, P, arms=[A((14, 20), 1), A((14, 40), 1, far=True)], legs=[Lp([P, (57, 30)])], head=(12.5, 30.5), eq=[G, poly([(14, 4), (14, GY)], .6, 2.4)])
POSES[91] = human_flag()
def burpee():
    S = (44, 37); P, F = lineP(S)
    return fig(S, P, arms=[A((44, GY), 1)], legs=[Lg(F)], eq=[G], mk=arc((26, 24), 14, 200, 520, .9, True))
POSES[92] = burpee()
def bear():
    S = (40, 36); P = (25, 36)
    return fig(S, P, arms=[A((40, GY), 1), Ap([S, (48, 41), (54, 51)], far=True)], legs=[Lp([P, (31, 46), (21, GY)]), Lp([P, (33, 45), (30, GY)], far=True)], head=(46, 37), eq=[G])
POSES[93] = bear()
def cartwheel():
    S = (28, 38); P = (28, 23)
    return fig(S, P, arms=[A((22, GY), 1), A((34, GY), -1)], legs=[Lp([P, (19, 14), (10, 4)]), Lp([P, (37, 14), (46, 4)])], head=(28, 45), eq=[G])
POSES[94] = cartwheel()
def boxjump():
    P = (44, 21); S = (46, 6)
    return fig(S, P, arms=[A((60, 9), 1)], legs=[Lg((48, 38)), Lp([P, (44, 29), (40, 38)], far=True)], eq=[*box(34, 64, 38), G.__class__(**G)])
POSES[95] = boxjump()
def jumpturn():
    S = (32, 19); P = (32, 34)
    return fig(S, P, arms=[Ap([S, (28, 11), (27, 3)]), Ap([S, (36, 11), (37, 3)])], legs=[Lp([P, (30, 45), (29, 55)]), Lp([P, (35, 45), (36, 53)])], head=(32, 13), eq=[G], mk=arc((32, 30), 13, 160, 380, .9, True, w=1.6))
POSES[96] = jumpturn()
def sprawl():
    S = (46, 47); P, F = lineP(S)
    return fig(S, P, arms=[A((46, GY), 1)], legs=[Lg(F)], eq=[G], mk=arrow((18, 46), (4, 46), .9))
POSES[97] = sprawl()
POSES[98] = mountain(pause((24, 30)))
def wrist():
    S = (38, 36); P = (23, 38)
    return fig(S, P, arms=[A((38, GY), 1)], legs=[Lp([P, (23, 50), (12, GY)])], head=(44, 38), eq=[G, poly([(38, GY), (30, GY)], 1, 2.6)], mk=arc((38, 50), 5, 20, 300, .9, True, w=1.5))
POSES[99] = wrist()
POSES[100] = eplank(mk=darrow((0, 59), (14, 59)))

# ===================== اصلاحات v2 =====================
POSES[1] = pushup(41)
POSES[4] = pushup(41, mk=diamond((46, 58.5)))
POSES[5] = pushup(41, mk=darrow((30, 58.5), (60, 58.5)))
POSES[6] = pushup(41, mk=arrow((38, 58.5), (44, 58.5)) + arrow((54, 58.5), (48, 58.5)))
POSES[3] = fig((42, 46), (27, 42), arms=[A((42, GY), 1)], legs=[Lp([(27, 42), (27, GY), (13, GY)])], eq=[G])
def hspu(wall_=True, arrows=False):
    S = (38, 37); P = (40, 22); F = (41, -2)
    return fig(S, P, arms=[A((36, GY), 1)], legs=[Lp([P, F])], head=(38, 43.5), eq=[G, *(wall(46, -4) if wall_ else [])],
               mk=(darrow((52, 12), (52, 40)) if arrows else []))
POSES[17] = hspu(True); POSES[18] = hspu(False, True); POSES[81] = hspu(False)

BY = 10
def pull_front(lh, rh, S=(32, 17), head=(32, 6.5), eqx=(), mk=(), bar_x=(8, 56), by=BY, sw=6, left_far=False, right_free=False):
    P = (S[0], S[1] + 15)
    arms = [A(lh, -1, side=-1), A(rh, 1, side=1)]
    legs = [Lp([(P[0] - 1.5, P[1]), (P[0] - 2, P[1] + 24)]), Lp([(P[0] + 1.5, P[1]), (P[0] + 2, P[1] + 24)])]
    return fig(S, P, arms=arms, legs=legs, head=head, sw=sw, eq=[*bar(bar_x[0], bar_x[1], by), *eqx], mk=mk)
POSES[21] = pull_front((21, BY), (43, BY))
POSES[22] = pull_front((11, BY), (53, BY), mk=darrow((12, 1), (52, 1)))
POSES[23] = pull_front((29, BY), (35, BY), mk=arrow((24, 1), (29, 1)) + arrow((40, 1), (35, 1)))
POSES[24] = pull_front((21, BY), (43, BY), eqx=[poly([(21, BY), (21, BY + 4)], .8, 2.2), poly([(43, BY), (43, BY + 4)], .8, 2.2)])
POSES[25] = pull_front((21, BY), (43, BY), mk=arc((21, BY), 4, 250, 40, .9, True, w=1.5)[:0] + arc((13, BY + 6), 3.5, 180, 420, .9, True, w=1.4) + arc((51, BY + 6), 3.5, 180, 420, .9, True, w=1.4))
POSES[26] = pull_front((30, BY), (34, BY), head=(22, 8), mk=[])
def archer_pull_f():
    S = (42, 17); P = (42, 32)
    return fig(S, P, arms=[A((22, BY), -1, side=-1), A((50, BY), 1, side=1)], legs=[Lp([(40.5, 32), (40, 56)]), Lp([(43.5, 32), (44, 56)])], head=(43, 6.5), sw=6, eq=bar(8, 58, BY))
POSES[28] = archer_pull_f()
def onearm_f():
    S = (34, 17); P = (34, 32)
    return fig(S, P, arms=[A((36, BY), 1, side=1), Ap([(28, 17), (25, 25), (26, 33)], side=0)], legs=[Lp([(32.5, 32), (32, 56)]), Lp([(35.5, 32), (36, 56)])], head=(34, 6.5), sw=6, eq=bar(14, 54, BY))
POSES[29] = onearm_f()
POSES[30] = pull_front((21, BY), (43, BY), mk=arc((32, 16), 22, 195, 345, .85, True, w=1.5, both=True))
POSES[31] = pull_front((21, 18), (43, 18), S=(32, 20), head=(32, 10), by=18, mk=arrow((54, 42), (54, 28), .8))
POSES[27] = fig((30, 19), (28.5, 34), arms=[A((38, 8), -1)], legs=[Lp([(28.5, 34), (52.5, 33)])], head=(29.5, 12.5), eq=[poly([(34, 8), (48, 8)], .55, 2.4)])
POSES[33] = fig((32, 16), (28, 31), arms=[A((34, 33), 1)], legs=[Lp([(28, 31), (27, 43), (19, 52)])], head=(35, 9.5), eq=[poly([(29, 33), (44, 33)], .55, 2.4)], mk=arrow((52, 26), (52, 14), .8))
POSES[34] = fig((32, 16), (28, 31), arms=[A((34, 33), 1)], legs=[Lp([(28, 31), (27, 43), (19, 52)])], head=(35, 9.5), eq=[poly([(34, -2), (34, 30)], .55, 1.6), circ((34, 33), 3, .6)])
POSES[32] = fig((31, 10), (25, 24), arms=[Ap([(31, 10), (31, 18), (37, 15)])], legs=[Lp([(25, 24), (24, 36), (19, 47)])], head=(36, 5), eq=[poly([(32, 15), (46, 15)], .55, 2.4)])
POSES[38] = fig((30, 24), (30, 39), arms=[A((34, 8), 1)], legs=[Lp([(30, 39), (30, 62)])], head=(30, 18), eq=[poly([(30, 8), (44, 8)], .55, 2.4)], mk=arc((44, 40), 22, 80, -100, .85, True, w=1.6))
POSES[40] = fig((22, 42), (36, 42), arms=[A((22, 33), -1)], legs=[Lp([(36, 42), (47, 47), (47, GY)])], head=(15.5, 43), eq=[G, poly([(16, 33), (30, 33)], .55, 2.4)])
POSES[86] = fig((18, 38), (33, 38), arms=[Ap([(18, 38), (9, 36), (1, 36)])], legs=[Lp([(33, 38), (57, 38)])], head=(12, 40.5), eq=[G, poly([(1, 36), (1, GY)], .55, 2.4)])
def jumpsq2():
    S = (32, 18); P = (32, 33)
    return fig(S, P, arms=[Ap([S, (27, 10), (25, 2)]), Ap([S, (37, 10), (39, 2)])], legs=[Lp([P, (30, 43), (29, 50)]), Lp([P, (35, 43), (37, 50)])], head=(32, 12), eq=[ground(57)], mk=motion(26, 53, 3, 3, 2))
POSES[44] = jumpsq2()

# ---------- رندر ----------
def bbox(prims):
    xs, ys = [], []
    for p in prims:
        if p['t'] == 'poly':
            for x, y in p['pts']: xs.append(x); ys.append(y)
        elif p['t'] == 'circ':
            xs += [p['c'][0] - p['r'], p['c'][0] + p['r']]; ys += [p['c'][1] - p['r'], p['c'][1] + p['r']]
    return min(xs), min(ys), max(xs), max(ys)

def render(prims, W=64, pad=5, maxscale=1.2):
    nong = [p for p in prims if p['t'] != 'ground']
    x1, y1, x2, y2 = bbox(nong)
    exp = []
    for p in prims:
        if p['t'] == 'ground':
            y = p['y']
            exp.append(poly([(x1 - 3, y), (x2 + 3, y)], .45, 2))
        else: exp.append(p)
    x1, y1, x2, y2 = bbox(exp)
    w, h = x2 - x1, y2 - y1
    s = min((W - 2 * pad) / w, (W - 2 * pad) / h, maxscale)
    ox = (W - w * s) / 2 - x1 * s; oy = (W - h * s) / 2 - y1 * s
    T = lambda p: (p[0] * s + ox, p[1] * s + oy)
    out = []
    f = lambda v: ('%.1f' % v).rstrip('0').rstrip('.')
    for p in exp:
        if p['t'] == 'poly':
            pts = [T(q) for q in p['pts']]
            d = 'M' + ' '.join(f(a) + ' ' + f(b) for a, b in pts).replace(' ', ',', 0)
            d = 'M' + 'L'.join(f(a) + ' ' + f(b) for a, b in pts)
            attrs = ''
            if p['op'] != 1: attrs += ' opacity="%s"' % f(p['op'])
            if p['w']: attrs += ' stroke-width="%s"' % f(p['w'])
            if p['dash']: attrs += ' stroke-dasharray="%s"' % p['dash']
            out.append('<path d="%s"%s/>' % (d, attrs))
        else:
            c = T(p['c']); r = p['r'] * s
            attrs = ''
            if p['op'] != 1: attrs += ' opacity="%s"' % f(p['op'])
            if p['fill']: attrs += ' fill="currentColor"'
            if p['w']: attrs += ' stroke-width="%s"' % f(p['w'])
            out.append('<circle cx="%s" cy="%s" r="%s"%s/>' % (f(c[0]), f(c[1]), f(r), attrs))
    return ''.join(out)

if __name__ == '__main__':
    icons = {}
    for i in range(1, 101):
        if i not in POSES: print('missing', i); continue
        icons[i] = render(POSES[i])
    js = '/* آیکون‌های مینیمال هر حرکت — تولیدشده از gen_icons.py؛ کلید = شناسهٔ حرکت */\nwindow.MOVE_ICONS = {\n' + ',\n'.join(f'  {k}: {json.dumps(v)}' for k, v in icons.items()) + '\n};\n'
    open(OUT_JS, 'w', encoding='utf-8').write(js)
    # contact sheet
    names = {}
    import re
    src = open(os.path.join(HERE, '..', 'www', 'js', 'data.js'), encoding='utf-8').read()
    for m in re.finditer(r'id: (\d+), cat: "(\w+)".*?\n\s+name: "([^"]+)"', src): names[int(m.group(1))] = m.group(3)
    cells = ''.join(f'<div class="c"><svg viewBox="0 0 64 64" width="150" height="150">{icons[i]}</svg><b>{i}</b> {names.get(i, "")}</div>' for i in icons)
    open(SHEET, 'w', encoding='utf-8').write('''<!doctype html><meta charset=utf-8><style>@font-face{font-family:W;src:url(../www/fonts/Waw-Medium.ttf)}
body{margin:0;background:#fff;color:#111;font:13px W;direction:rtl}.g{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;padding:6px}
.c{border:1px solid #ddd;text-align:center;padding:2px}svg{fill:none;stroke:#e0522b;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;background:#faf3ef;display:block;margin:auto}</style><div class=g>''' + cells + '</div>')
    print('ok', len(icons))
