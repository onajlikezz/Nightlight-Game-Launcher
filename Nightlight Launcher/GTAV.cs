using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Windows.Forms;

namespace Nightlight_Launcher
{
	// Token: 0x02000002 RID: 2
	public partial class GTAV : Form
	{
		// Token: 0x06000001 RID: 1 RVA: 0x00002050 File Offset: 0x00000250
		public GTAV()
		{
			this.InitializeComponent();
		}

		// Token: 0x06000002 RID: 2 RVA: 0x00002068 File Offset: 0x00000268
		private void button1_Click(object sender, EventArgs e)
		{
			bool flag = string.IsNullOrWhiteSpace(this.selectedFolderTextBox.Text);
			bool flag2 = flag;
			if (flag2)
			{
				this.button3_Click(sender, e);
			}
			else
			{
				this.DownloadFiles();
			}
		}

		// Token: 0x06000003 RID: 3 RVA: 0x000020A4 File Offset: 0x000002A4
		private void button2_Click(object sender, EventArgs e)
		{
			string text = this.selectedFolderPath + "\\PlayGTAV.exe";
			bool flag = File.Exists(text);
			bool flag2 = flag;
			bool flag3 = flag2;
			bool flag4 = flag3;
			if (flag4)
			{
				try
				{
					Process.Start(text);
				}
				catch (Exception ex)
				{
					MessageBox.Show("An error occurred while launching the application: " + ex.Message);
				}
			}
			else
			{
				MessageBox.Show("The file PlayGTAV.exe was not found at the location: " + text);
			}
		}

		// Token: 0x06000004 RID: 4 RVA: 0x00002124 File Offset: 0x00000324
		private void button3_Click(object sender, EventArgs e)
		{
			using (FolderBrowserDialog folderBrowserDialog = new FolderBrowserDialog())
			{
				DialogResult dialogResult = folderBrowserDialog.ShowDialog();
				bool flag = dialogResult == DialogResult.OK && !string.IsNullOrWhiteSpace(folderBrowserDialog.SelectedPath);
				bool flag2 = flag;
				bool flag3 = flag2;
				bool flag4 = flag3;
				bool flag5 = flag4;
				if (flag5)
				{
					this.selectedFolderPath = folderBrowserDialog.SelectedPath;
					this.selectedFolderTextBox.Text = this.selectedFolderPath;
				}
			}
		}

		// Token: 0x06000005 RID: 5 RVA: 0x000021A8 File Offset: 0x000003A8
		private void textBox1_TextChanged(object sender, EventArgs e)
		{
			this.selectedFolderPath = this.selectedFolderTextBox.Text;
		}

		// Token: 0x06000006 RID: 6 RVA: 0x000021BC File Offset: 0x000003BC
		private void DownloadFiles()
		{
			Dictionary<string, string> dictionary = new Dictionary<string, string>
			{
				{
					"PlayGTAV.exe",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAV/PlayGTAV.exe"
				},
				{
					"launc.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAV/launc.dll"
				},
				{
					"orig_socialclub.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAV/orig_socialclub.dll"
				},
				{
					"bink2w64.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAV/bink2w64.dll"
				},
				{
					"socialclub.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAV/socialclub.dll"
				}
			};
			string path = this.selectedFolderPath + "\\GTAV.exe";
			string path2 = this.selectedFolderPath + "\\GTA5.exe";
			string path3 = this.selectedFolderPath + "\\PlayGTAV.exe";
			bool flag = File.Exists(path) || File.Exists(path2) || File.Exists(path3);
			if (flag)
			{
				string command = "powershell -Command \"& {Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(0, 'NLGL Information', 'The location you entered contains the game!', [System.Windows.Forms.ToolTipIcon]::None)}\"";
				GTAV.ExecuteCommand(command);
				foreach (KeyValuePair<string, string> keyValuePair in dictionary)
				{
					string key = keyValuePair.Key;
					string value = keyValuePair.Value;
					string fileName = Path.Combine(this.selectedFolderPath, key);
					try
					{
						using (WebClient webClient = new WebClient())
						{
							webClient.DownloadFile(value, fileName);
						}
					}
					catch (Exception ex)
					{
						MessageBox.Show("Error downloading file '" + key + "': " + ex.Message);
					}
				}
				MessageBox.Show("The game has been successfully bypassed!\nGame Location: " + this.selectedFolderPath, "Information", MessageBoxButtons.OK, MessageBoxIcon.Asterisk);
			}
			else
			{
				string command2 = "powershell -Command \"& {Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(0, 'NLGL Information', 'The location you entered does not contain the game!', [System.Windows.Forms.ToolTipIcon]::None)}\"";
				GTAV.ExecuteCommand(command2);
				foreach (KeyValuePair<string, string> keyValuePair2 in dictionary)
				{
					string key2 = keyValuePair2.Key;
					string value2 = keyValuePair2.Value;
					string fileName2 = Path.Combine(this.selectedFolderPath, key2);
					try
					{
						using (WebClient webClient2 = new WebClient())
						{
							webClient2.DownloadFile(value2, fileName2);
						}
					}
					catch (Exception ex2)
					{
						MessageBox.Show("Error downloading file '" + key2 + "': " + ex2.Message);
					}
				}
				MessageBox.Show("The bypass files have been downloaded to the location:\n" + this.selectedFolderPath + "\n\nNote: NLGL did not detect that the game is installed at this location! You may encounter issues when trying to run it.", "Information", MessageBoxButtons.OK, MessageBoxIcon.Asterisk);
			}
		}

		// Token: 0x06000007 RID: 7 RVA: 0x00002470 File Offset: 0x00000670
		private void OpenGameDir_Click(object sender, EventArgs e)
		{
			bool flag = Directory.Exists(this.selectedFolderPath);
			if (flag)
			{
				Process.Start("explorer.exe", this.selectedFolderPath);
			}
			else
			{
				MessageBox.Show("The folder path is not valid. Please enter a valid folder path.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}

		// Token: 0x06000008 RID: 8 RVA: 0x000024B8 File Offset: 0x000006B8
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

		// Token: 0x04000001 RID: 1
		private string selectedFolderPath;
	}
}
