using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using Nightlight_Launcher.Properties;

namespace Nightlight_Launcher
{
	// Token: 0x02000003 RID: 3
	public partial class Main : Form
	{
		// Token: 0x0600000B RID: 11 RVA: 0x00002B28 File Offset: 0x00000D28
		public Main()
		{
			string command = "powershell -Command \"& {Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(0, 'You have successfully launched NLGL', 'This software is free. If you purchased it, please request a refund!', [System.Windows.Forms.ToolTipIcon]::None)}\"";
			Main.ExecuteCommand(command);
			this.InitializeComponent();
		}

		// Token: 0x0600000C RID: 12 RVA: 0x00002B58 File Offset: 0x00000D58
		private static void ExecuteCommand(string command)
		{
			ProcessStartInfo processStartInfo = new ProcessStartInfo("cmd.exe", "/c " + command);
			processStartInfo.CreateNoWindow = true;
			processStartInfo.UseShellExecute = false;
			processStartInfo.RedirectStandardOutput = true;
			processStartInfo.RedirectStandardError = true;
			Process process = new Process();
			process.StartInfo = processStartInfo;
			process.Start();
			string str = process.StandardOutput.ReadToEnd();
			string str2 = process.StandardError.ReadToEnd();
			process.WaitForExit();
			Console.WriteLine("Output: " + str);
			Console.WriteLine("Error: " + str2);
		}

		// Token: 0x0600000D RID: 13 RVA: 0x00002BF4 File Offset: 0x00000DF4
		private void GTAV_Click(object sender, EventArgs e)
		{
			GTAV gtav = new GTAV();
			gtav.TopLevel = false;
			this.panelDisplay.Controls.Add(gtav);
			gtav.BringToFront();
			gtav.Show();
		}

		// Token: 0x0600000E RID: 14 RVA: 0x00002C30 File Offset: 0x00000E30
		private void RDR2_Click(object sender, EventArgs e)
		{
			RDR2 rdr = new RDR2();
			rdr.TopLevel = false;
			this.panelDisplay.Controls.Add(rdr);
			rdr.BringToFront();
			rdr.Show();
		}

		// Token: 0x0600000F RID: 15 RVA: 0x00002C6C File Offset: 0x00000E6C
		private void gtaiv_Click(object sender, EventArgs e)
		{
			GTAIV gtaiv = new GTAIV();
			gtaiv.TopLevel = false;
			this.panelDisplay.Controls.Add(gtaiv);
			gtaiv.BringToFront();
			gtaiv.Show();
		}

		// Token: 0x06000010 RID: 16 RVA: 0x00002CA8 File Offset: 0x00000EA8
		private void Discord_Click(object sender, EventArgs e)
		{
			string fileName = "https://discord.gg/pBFaCQQVBV";
			Process.Start(fileName);
		}

		// Token: 0x06000011 RID: 17 RVA: 0x00002CC4 File Offset: 0x00000EC4
		private void Updates_Click(object sender, EventArgs e)
		{
			string fileName = "https://github.com/onajlikezz/Nightlight-Game-Launcher/releases";
			Process.Start(fileName);
		}
	}
}
