using System;
using System.Windows.Forms;

namespace Nightlight_Launcher
{
	// Token: 0x02000004 RID: 4
	internal static class Program
	{
		// Token: 0x06000014 RID: 20 RVA: 0x00003BA9 File Offset: 0x00001DA9
		[STAThread]
		private static void Main()
		{
			Application.EnableVisualStyles();
			Application.SetCompatibleTextRenderingDefault(false);
			Application.Run(new Main());
		}
	}
}
