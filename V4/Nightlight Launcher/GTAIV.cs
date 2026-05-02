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
	// Token: 0x02000005 RID: 5
	public partial class GTAIV : Form
	{
		// Token: 0x06000015 RID: 21 RVA: 0x00003BC4 File Offset: 0x00001DC4
		public GTAIV()
		{
			this.InitializeComponent();
		}

		// Token: 0x06000016 RID: 22 RVA: 0x00003BDC File Offset: 0x00001DDC
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

		// Token: 0x06000017 RID: 23 RVA: 0x00003C18 File Offset: 0x00001E18
		private void button2_Click(object sender, EventArgs e)
		{
			string text = this.selectedFolderPath + "\\PlayGTAIV.exe";
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
				MessageBox.Show("The file PlayGTAIV.exe was not found at the location: " + text);
			}
		}

		// Token: 0x06000018 RID: 24 RVA: 0x00003C98 File Offset: 0x00001E98
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

		// Token: 0x06000019 RID: 25 RVA: 0x00003D1C File Offset: 0x00001F1C
		private void textBox1_TextChanged(object sender, EventArgs e)
		{
			this.selectedFolderPath = this.selectedFolderTextBox.Text;
		}

		// Token: 0x0600001A RID: 26 RVA: 0x00003D30 File Offset: 0x00001F30
		private void DownloadFiles()
		{
			Dictionary<string, string> dictionary = new Dictionary<string, string>
			{
				{
					"PlayGTAIV.exe",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAIV/PlayGTAIV.exe"
				},
				{
					"binkw32.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAIV/binkw32.dll"
				},
				{
					"launc.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAIV/launc.dll"
				},
				{
					"orig_socialclub.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAIV/orig_socialclub.dll"
				},
				{
					"socialclub.dll",
					"https://github.com/onajlikezz/Nightlight-Game-Launcher/raw/main/Modules/GTAIV/socialclub.dll"
				}
			};
			string path = this.selectedFolderPath + "\\GTAIV.exe";
			bool flag = File.Exists(path);
			if (flag)
			{
				string command = "powershell -Command \"& {Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(0, 'NLGL Information', 'The location you entered contains the game!', [System.Windows.Forms.ToolTipIcon]::None)}\"";
				GTAIV.ExecuteCommand(command);
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
				GTAIV.ExecuteCommand(command2);
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

		// Token: 0x0600001B RID: 27 RVA: 0x00003FAC File Offset: 0x000021AC
		private void OpenGameLocation_Click(object sender, EventArgs e)
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

		// Token: 0x0600001C RID: 28 RVA: 0x00003FF4 File Offset: 0x000021F4
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

		// Token: 0x0400001C RID: 28
		private string selectedFolderPath;
	}
}
