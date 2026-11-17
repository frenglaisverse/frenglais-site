/* La Courbe des Temps, au trait de Paul (dessin original vectorisé).
   FRGcourbe({ xs:[T-2, T-1, T0, T+1], x0, x1, y, k, couleur, rouge, couleurRouge }) renvoie { noir, rouge, svg } :
   les repères sont recalés sur xs sans déformer le trait (seuls les segments de ligne entre eux s'allongent). */
(function (racine) {
  var D = {"n":[[[210,69],[207,65],[158,67],[17,67],[8,72],[6,76],[6,84],[8,88],[15,93],[43,97],[156,98],[202,96],[205,94],[206,82],[210,75]],[[1664,86],[1661,79],[1642,61],[1588,16],[1576,10],[1571,10],[1564,15],[1562,19],[1563,29],[1586,53],[1614,79],[1614,81],[1608,87],[1601,80],[1594,78],[1567,76],[1487,75],[1446,66],[1408,66],[1339,72],[1342,99],[1344,102],[1407,97],[1445,97],[1484,106],[1514,109],[1564,112],[1601,112],[1613,109],[1621,109],[1623,111],[1622,114],[1555,188],[1552,195],[1552,200],[1554,205],[1562,210],[1568,210],[1574,207],[1590,190],[1621,151],[1652,121],[1663,105]],[[1313,72],[1311,69],[1281,64],[1165,61],[1092,62],[946,70],[872,65],[870,63],[868,17],[865,10],[858,6],[849,7],[845,10],[843,14],[841,25],[842,64],[840,66],[826,67],[769,77],[694,78],[520,68],[518,66],[518,33],[515,23],[513,20],[508,18],[500,18],[493,23],[490,39],[489,65],[487,67],[442,66],[381,70],[360,70],[329,65],[302,63],[253,63],[236,65],[236,84],[238,94],[309,94],[356,99],[489,97],[492,102],[494,127],[494,143],[489,160],[492,168],[495,171],[502,174],[508,174],[515,170],[522,158],[523,129],[520,102],[522,98],[681,108],[749,109],[766,107],[797,100],[840,96],[842,98],[844,156],[848,190],[855,197],[858,198],[869,197],[874,193],[877,186],[877,179],[873,173],[871,98],[873,96],[930,100],[971,100],[1099,92],[1214,92],[1273,94],[1312,100],[1314,96]]],"r":[[[1317,13],[1310,16],[1306,21],[1305,25],[1308,46],[1313,63],[1315,82],[1314,162],[1316,170],[1321,176],[1325,178],[1334,178],[1338,176],[1344,170],[1345,167],[1345,137],[1342,102],[1331,23],[1325,15]],[[214,10],[208,15],[205,32],[205,57],[211,68],[211,75],[208,80],[206,90],[207,136],[209,152],[213,160],[221,165],[227,165],[235,161],[239,155],[239,146],[237,142],[232,21],[229,14],[223,10]]]};
  var SRC = { debut: 6, ticks: [223, 506, 857, 1325], w: 32, fleche: [1548, 1666], y: 82 };
  var PONT = [[223, 80], [1325, 82]];   /* la ligne passe sous les repères rouges : on la referme quand ils sont masqués */
  function carte(xs, x0, x1, k) {
    var a = [[SRC.debut, x0]];
    SRC.ticks.forEach(function (t, i) { a.push([t - SRC.w, xs[i] - SRC.w * k]); a.push([t + SRC.w, xs[i] + SRC.w * k]); });
    a.push([SRC.fleche[0], x1 - (SRC.fleche[1] - SRC.fleche[0]) * k]); a.push([SRC.fleche[1], x1]);
    return function (x) {
      if (x <= a[0][0]) return a[0][1] + (x - a[0][0]) * k;
      for (var i = 1; i < a.length; i++) if (x <= a[i][0]) { var p = a[i - 1], q = a[i]; return p[1] + (x - p[0]) * (q[1] - p[1]) / (q[0] - p[0]); }
      var l = a[a.length - 1]; return l[1] + (x - l[0]) * k;
    };
  }
  function FRGcourbe(o) {
    var k = o.k || 0.22, f = carte(o.xs, o.x0, o.x1, k), Y = function (y) { return o.y + (y - SRC.y) * k; };
    var p = function (cs) { return cs.map(function (c) { return 'M' + c.map(function (pt) { return f(pt[0]).toFixed(1) + ' ' + Y(pt[1]).toFixed(1); }).join('L') + 'Z'; }).join(''); };
    var col = o.couleur || 'currentColor', rouge = o.rouge !== false;
    var ponts = PONT.map(function (pt, i) { var cx = o.xs[i ? 3 : 0], h = 32 * k, w = 40 * k; return 'M' + (cx - w).toFixed(1) + ' ' + (Y(pt[1]) - h / 2).toFixed(1) + 'h' + (2 * w).toFixed(1) + 'v' + h.toFixed(1) + 'h' + (-2 * w).toFixed(1) + 'Z'; }).join('');
    var noir = '<path fill="' + col + '" d="' + p(D.n) + '"/><path fill="' + col + '" d="' + ponts + '"/>';
    var r = '<path fill="' + (o.couleurRouge || '#e3191f') + '" d="' + p(D.r) + '"/>';
    return { noir: noir, rouge: r, svg: '<g class="cdt">' + noir + (rouge ? r : '') + '</g>' };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = FRGcourbe; else racine.FRGcourbe = FRGcourbe;
})(this);
